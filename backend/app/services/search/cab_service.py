"""Cab search service. All fares via CabPricingService — never hardcoded."""

from app.providers import registry
from app.services import cab_pricing
from app.services.cache import get_cache
from app.services.search.base import SearchError, cache_key, cached_count, envelope, now_ms, observe

TRIP_TYPES = {"airport", "local", "outstation", "one_way", "round_trip", "multi_day"}


def validate(pickup: str | None, drop: str | None, trip_type: str = "one_way") -> dict:
    p, d = (pickup or "").strip(), (drop or "").strip()
    if not p or not d:
        raise SearchError("INVALID_SEARCH", "Pickup and drop locations are required.")
    tt = (trip_type or "one_way").lower()
    if tt not in TRIP_TYPES:
        raise SearchError("INVALID_SEARCH", f"Trip type must be one of {sorted(TRIP_TYPES)}.")
    return {"pickup": p, "drop": d, "trip_type": tt}


async def search_cabs(params: dict, request_id: str, filters: dict | None = None, sort: str = "recommended") -> dict:
    v = validate(params.get("pickup") or params.get("origin"), params.get("drop") or params.get("destination"),
                  params.get("trip_type", "one_way"))
    provider = registry.get_cab_provider()
    if getattr(provider, "name", "") == "disabled":
        raise SearchError("PROVIDER_UNAVAILABLE")
    cache = get_cache()
    key = cache_key("cabs", {**v, "filters": filters or {}, "sort": sort})
    cached = await cache.get(key)
    if cached is not None:
        observe("cabs", provider.name, 0, cached_count(cached), "CACHE_HIT", request_id)
        return cached
    started = now_ms()
    try:
        offers = await provider.search(v["pickup"], v["drop"])
    except SearchError:
        raise
    except Exception as e:
        observe("cabs", provider.name, now_ms() - started, 0, "ERROR", request_id)
        raise SearchError("PROVIDER_UNAVAILABLE", str(e))
    results = []
    for o in offers:
        row = o.model_dump() if hasattr(o, "model_dump") else dict(o)
        # Re-price deterministically through the single pricing engine.
        vehicle = str(row.get("vehicle_type", "Sedan")).lower()
        vehicle_key = "premium" if "premium" in vehicle else ("suv" if "suv" in vehicle else ("luxury" if "luxury" in vehicle else "sedan"))
        fare = cab_pricing.estimate_fare(120.0, vehicle_key, "oneway")
        row["base_fare"] = fare["base_fare"]
        row["toll_estimate"] = fare["toll_estimate"]
        row["taxes"] = fare["taxes"]
        row["total_price"] = fare["total"]
        row["price"] = fare["total"]
        results.append(row)
    if filters and filters.get("vehicle"):
        results = [r for r in results if filters["vehicle"].lower() in str(r.get("vehicle_type", "")).lower()]
    if sort == "price":
        results.sort(key=lambda r: r.get("total_price", 0) or 0)
    elif sort == "rating":
        results.sort(key=lambda r: r.get("driver_rating", 0) or 0, reverse=True)
    payload = envelope(results, {"name": provider.name, "status": "DEMO"}, request_id)
    await cache.set(key, payload, ttl_seconds=300)
    observe("cabs", provider.name, now_ms() - started, len(results), "SUCCESS", request_id)
    return payload
