"""Cab search service. Routing distance in, honest estimate out — never hardcoded."""

from app.services import cab_pricing
from app.services.cache import get_cache
from app.services.search.base import (
    SearchError,
    cache_key,
    cached_count,
    envelope_with_mode,
    now_ms,
    observe,
    run_chain,
)

TRIP_TYPES = {"airport", "local", "outstation", "one_way", "round_trip", "multi_day"}


def validate(pickup: str | None, drop: str | None, trip_type: str = "one_way") -> dict:
    p, d = (pickup or "").strip(), (drop or "").strip()
    if not p or not d:
        raise SearchError("INVALID_SEARCH", "Pickup and drop locations are required.")
    tt = (trip_type or "one_way").lower()
    if tt not in TRIP_TYPES:
        raise SearchError("INVALID_SEARCH", f"Trip type must be one of {sorted(TRIP_TYPES)}.")
    return {"pickup": p, "drop": d, "trip_type": tt}


async def _resolve_distance_km(pickup: str, drop: str) -> tuple[float, str]:
    """Best-effort routing distance. Falls back to a labelled planning
    baseline only when routing is unavailable — never silently."""
    from app.providers import registry as reg

    try:
        geo = reg.get_geocoding_provider()
        if getattr(geo, "name", "") == "disabled":
            raise ValueError("geocoding disabled")
        o_hits = await geo.geocode(pickup, 1)
        d_hits = await geo.geocode(drop, 1)
        o = f"{o_hits[0]['lat']},{o_hits[0]['lon']}"
        d = f"{d_hits[0]['lat']},{d_hits[0]['lon']}"
        for router in reg.get_provider_chain("routing"):
            if getattr(router, "name", "") == "disabled":
                continue
            try:
                route = await router.calculate_route(o, d)
                data = route.get("data", route) if isinstance(route, dict) else {}
                km = float(data.get("distance_km") or 0)
                if km > 0:
                    return km, "measured"
            except Exception:
                continue
    except Exception:
        pass
    return 120.0, "assumed"


async def search_cabs(params: dict, request_id: str, filters: dict | None = None, sort: str = "recommended") -> dict:
    v = validate(params.get("pickup") or params.get("origin"), params.get("drop") or params.get("destination"),
                  params.get("trip_type", "one_way"))
    cache = get_cache()
    key = cache_key("cabs", {**v, "filters": filters or {}, "sort": sort})
    cached = await cache.get(key)
    if cached is not None:
        provider_name = ((cached.get("data") or {}).get("provider") or {}).get("name", "?")
        observe("cabs", provider_name, 0, cached_count(cached), "CACHE_HIT", request_id)
        return cached

    async def fetch(provider):
        return await provider.search(v["pickup"], v["drop"])

    started = now_ms()
    offers, provider = await run_chain("cab", fetch)
    distance_km, distance_source = await _resolve_distance_km(v["pickup"], v["drop"])
    results = []
    for o in offers:
        row = o.model_dump() if hasattr(o, "model_dump") else dict(o)
        # Re-price deterministically through the single pricing engine.
        vehicle = str(row.get("vehicle_type", "Sedan")).lower()
        vehicle_key = "premium" if "premium" in vehicle else ("suv" if "suv" in vehicle else ("luxury" if "luxury" in vehicle else "sedan"))
        fare = cab_pricing.estimate_fare(distance_km, vehicle_key, "oneway")
        row["base_fare"] = fare["base_fare"]
        row["toll_estimate"] = fare["toll_estimate"]
        row["taxes"] = fare["taxes"]
        row["total_price"] = fare["total"]
        row["price"] = fare["total"]
        row["distance_km"] = fare["distance_km"]
        row["distance_source"] = distance_source
        results.append(row)
    if filters and filters.get("vehicle"):
        results = [r for r in results if filters["vehicle"].lower() in str(r.get("vehicle_type", "")).lower()]
    if sort == "price":
        results.sort(key=lambda r: r.get("total_price", 0) or 0)
    elif sort == "rating":
        results.sort(key=lambda r: (r.get("driver_rating") is not None, r.get("driver_rating") or 0), reverse=True)
    payload = envelope_with_mode(results, provider, request_id, "cab")
    await cache.set(key, payload, ttl_seconds=300)
    observe("cabs", provider.name, now_ms() - started, len(results), "SUCCESS", request_id)
    return payload
