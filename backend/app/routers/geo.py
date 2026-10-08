"""Server-side geo: geocoding + routing + cab estimates + provider health.

Rate-limited and cached. Frontend never calls OSM/OSRM directly.
"""

from fastapi import APIRouter, Depends, HTTPException

from app.providers.free import NominatimGeocodingProvider, ProviderError
from app.schemas.schemas import GeocodeRequest, RouteRequest
from app.services import capability
from app.services.cab_pricing import estimate_fare
from app.services.rate_limit import check_rate_limit

router = APIRouter(prefix="/geo", tags=["geo"])


@router.post("/geocode")
async def geocode(body: GeocodeRequest):
    if not check_rate_limit("geo:geocode", max_hits=30, window_seconds=60):
        raise HTTPException(status_code=429, detail="Too many requests. Please wait.")
    try:
        return {"results": await NominatimGeocodingProvider().geocode(body.query, body.limit)}
    except ProviderError as e:
        raise HTTPException(status_code=502 if e.state != "NO_RESULTS" else 404, detail=str(e))


@router.post("/route")
async def route(body: RouteRequest):
    if not check_rate_limit("geo:route", max_hits=60, window_seconds=60):
        raise HTTPException(status_code=429, detail="Too many requests. Please wait.")
    from app.providers import registry as reg

    async def resolve(point: str) -> str:
        point = point.strip()
        if "," in point:
            return point
        try:
            hits = await NominatimGeocodingProvider().geocode(point, 1)
            return f"{hits[0]['lat']},{hits[0]['lon']}"
        except ProviderError as e:
            raise HTTPException(status_code=502, detail=f"Could not locate '{point}': {e}")

    origin = await resolve(body.origin)
    destination = await resolve(body.destination)
    # Try the configured routing chain; fall back to a labelled estimate
    # (haversine x1.3) rather than failing the whole request.
    last_error: Exception | None = None
    for router_provider in reg.get_provider_chain("routing"):
        if getattr(router_provider, "name", "") == "disabled":
            continue
        try:
            r = await router_provider.calculate_route(origin, destination)
            data = r.get("data", r) if isinstance(r, dict) else {}
            fare = estimate_fare(float(data.get("distance_km") or 0), "sedan", body.trip_type, body.tolls, body.night_halt)
            return {"route": r, "fare_estimate": fare, "mode": "LIVE" if router_provider.name == "osrm" else "ESTIMATE"}
        except ProviderError as e:
            last_error = e
        except Exception as e:  # noqa: BLE001 — never fail routing outright
            last_error = e
    try:
        from app.providers.routing.estimate import EstimateRoutingProvider

        r = await EstimateRoutingProvider().calculate_route(origin, destination)
        data = r.get("data", r) if isinstance(r, dict) else {}
        fare = estimate_fare(float(data.get("distance_km") or 0), "sedan", body.trip_type, body.tolls, body.night_halt)
        return {"route": r, "fare_estimate": fare, "mode": "ESTIMATE"}
    except Exception:
        raise HTTPException(status_code=502, detail=str(last_error or "Routing unavailable"))


@router.post("/cab-estimate")
async def cab_estimate(body: RouteRequest):
    if not check_rate_limit("geo:cab", max_hits=60, window_seconds=60):
        raise HTTPException(status_code=429, detail="Too many requests. Please wait.")
    # Distance may come from a prior /route call or be estimated by the caller.
    return estimate_fare(0.0, body.vehicle, body.trip_type, body.tolls, body.night_halt)


@router.get("/weather")
async def weather(lat: float, lon: float, days: int = 3):
    """Current conditions + short forecast. Hides gracefully on failure
    (frontend drops the chips); never invents values."""
    from app.providers import registry as reg

    if not (-90.0 <= lat <= 90.0) or not (-180.0 <= lon <= 180.0):
        raise HTTPException(status_code=400, detail="Latitude/longitude out of range.")
    days = max(1, min(int(days or 3), 7))
    if not check_rate_limit("geo:weather", max_hits=60, window_seconds=60):
        raise HTTPException(status_code=429, detail="Too many requests. Please wait.")
    for provider in reg.get_provider_chain("weather"):
        if getattr(provider, "name", "") in ("disabled",):
            continue
        forecast = getattr(provider, "forecast", None)
        if not callable(forecast):
            continue
        try:
            return await forecast(lat, lon, days)
        except ProviderError:
            continue
        except Exception:  # noqa: BLE001 — weather is best-effort
            continue
    raise HTTPException(status_code=502, detail="Weather unavailable right now.")


@router.get("/providers/health")
async def provider_health():
    return {"providers": capability.provider_health()}
