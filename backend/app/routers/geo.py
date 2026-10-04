"""Server-side geo: geocoding + routing + cab estimates + provider health.

Rate-limited and cached. Frontend never calls OSM/OSRM directly.
"""

from fastapi import APIRouter, Depends, HTTPException

from app.providers.free import NominatimGeocodingProvider, OSRMRoutingProvider, ProviderError
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
    provider = OSRMRoutingProvider()

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
    try:
        r = await provider.calculate_route(origin, destination)
    except ProviderError as e:
        raise HTTPException(status_code=502, detail=str(e))
    fare = estimate_fare(r["distance_km"], "sedan", body.trip_type, body.tolls, body.night_halt)
    return {"route": r, "fare_estimate": fare}


@router.post("/cab-estimate")
async def cab_estimate(body: RouteRequest):
    if not check_rate_limit("geo:cab", max_hits=60, window_seconds=60):
        raise HTTPException(status_code=429, detail="Too many requests. Please wait.")
    # Distance may come from a prior /route call or be estimated by the caller.
    return estimate_fare(0.0, body.vehicle, body.trip_type, body.tolls, body.night_halt)


@router.get("/providers/health")
async def provider_health():
    return {"providers": capability.provider_health()}
