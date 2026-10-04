"""Hotel search service. Demo inventory only — booking via assistance."""

from app.providers import registry
from app.services.cache import get_cache
from app.services.search.base import SearchError, cache_key, cached_count, envelope, now_ms, observe


def validate(destination: str | None, checkin: str | None, checkout: str | None, guests: int = 2) -> dict:
    from datetime import date as date_cls

    dest = (destination or "").strip()
    if not dest:
        raise SearchError("INVALID_SEARCH", "Destination is required.")
    for label, value in (("check-in", checkin), ("check-out", checkout)):
        if value:
            try:
                y, m, day = map(int, value.split("-"))
                date_cls(y, m, day)
            except Exception:
                raise SearchError("INVALID_SEARCH", f"{label} date must be YYYY-MM-DD.")
    if checkin and checkout and checkout <= checkin:
        raise SearchError("INVALID_SEARCH", "Check-out must be after check-in.")
    if (guests or 0) < 1:
        raise SearchError("INVALID_SEARCH", "Guests must be at least 1.")
    return {"destination": dest, "checkin": checkin, "checkout": checkout, "guests": guests or 2}


def apply_filters(offers: list[dict], filters: dict) -> list[dict]:
    out = list(offers)
    if filters.get("max_price") is not None:
        out = [o for o in out if (o.get("total_price", 0) or 0) <= filters["max_price"]]
    if filters.get("min_rating") is not None:
        out = [o for o in out if (o.get("rating", 0) or 0) >= filters["min_rating"]]
    if filters.get("breakfast"):
        out = [o for o in out if o.get("breakfast", True)]
    if filters.get("category"):
        out = [o for o in out if filters["category"].lower() in str(o.get("room_type", "")).lower()]
    return out


def apply_sort(offers: list[dict], sort: str) -> list[dict]:
    out = list(offers)
    if sort == "price":
        out.sort(key=lambda o: o.get("total_price", 0) or 0)
    elif sort == "rating":
        out.sort(key=lambda o: o.get("rating", 0) or 0, reverse=True)
    return out


async def search_hotels(params: dict, request_id: str, filters: dict | None = None, sort: str = "recommended") -> dict:
    v = validate(params.get("destination"), params.get("checkin") or params.get("check_in"),
                 params.get("checkout") or params.get("check_out"), int(params.get("guests", 2) or 2))
    provider = registry.get_hotel_provider()
    if getattr(provider, "name", "") == "disabled":
        raise SearchError("PROVIDER_UNAVAILABLE")
    cache = get_cache()
    key = cache_key("hotels", {**v, "filters": filters or {}, "sort": sort})
    cached = await cache.get(key)
    if cached is not None:
        observe("hotels", provider.name, 0, cached_count(cached), "CACHE_HIT", request_id)
        return cached
    started = now_ms()
    try:
        offers = await provider.search(v["destination"], v["checkin"], v["checkout"])
    except SearchError:
        raise
    except Exception as e:
        observe("hotels", provider.name, now_ms() - started, 0, "ERROR", request_id)
        raise SearchError("PROVIDER_UNAVAILABLE", str(e))
    results = [o.model_dump() if hasattr(o, "model_dump") else dict(o) for o in offers]
    results = apply_sort(apply_filters(results, filters or {}), sort)
    payload = envelope(results, {"name": provider.name, "status": "DEMO"}, request_id)
    await cache.set(key, payload, ttl_seconds=300)
    observe("hotels", provider.name, now_ms() - started, len(results), "SUCCESS", request_id)
    return payload
