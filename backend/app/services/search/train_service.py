"""Train search service. No scraping — demo schedules only, clearly labeled."""

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


def validate(origin: str | None, destination: str | None, date: str | None) -> dict:
    from datetime import date as date_cls

    o, d = (origin or "").strip(), (destination or "").strip()
    if not o or not d:
        raise SearchError("INVALID_SEARCH", "Origin and destination stations are required.")
    if o.lower() == d.lower():
        raise SearchError("INVALID_SEARCH", "Origin and destination must differ.")
    if date:
        try:
            y, m, day = map(int, date.split("-"))
            if date_cls(y, m, day) < date_cls.today():
                raise SearchError("INVALID_SEARCH", "Travel date cannot be in the past.")
        except SearchError:
            raise
        except Exception:
            raise SearchError("INVALID_SEARCH", "Date must be YYYY-MM-DD.")
    return {"origin": o, "destination": d, "date": date}


def apply_filters(offers: list[dict], filters: dict) -> list[dict]:
    out = list(offers)
    if filters.get("travel_class") and filters["travel_class"] != "All Classes":
        out = [o for o in out if o.get("travel_class") == filters["travel_class"]]
    if filters.get("max_price") is not None:
        out = [o for o in out if o.get("fare") is not None and o["fare"] <= filters["max_price"]]
    if filters.get("available_only"):
        out = [o for o in out if "available" in str(o.get("availability", "")).lower()]
    return out


def apply_sort(offers: list[dict], sort: str) -> list[dict]:
    out = list(offers)
    if sort == "cheapest":
        out.sort(key=lambda o: (o.get("fare") is None, o.get("fare") or 0))
    elif sort == "fastest":
        out.sort(key=lambda o: o.get("duration_minutes", 0) or 0)
    elif sort == "earliest":
        out.sort(key=lambda o: str(o.get("departure", "")))
    return out


async def search_trains(params: dict, request_id: str, filters: dict | None = None, sort: str = "recommended") -> dict:
    v = validate(params.get("origin"), params.get("destination"), params.get("departure_date") or params.get("date"))
    cache = get_cache()
    key = cache_key("trains", {**v, "filters": filters or {}, "sort": sort})
    cached = await cache.get(key)
    if cached is not None:
        provider_name = ((cached.get("data") or {}).get("provider") or {}).get("name", "?")
        observe("trains", provider_name, 0, cached_count(cached), "CACHE_HIT", request_id)
        return cached

    async def fetch(provider):
        return await provider.search(v["origin"], v["destination"], v["date"])

    started = now_ms()
    offers, provider = await run_chain("train", fetch)
    results = [o.model_dump() if hasattr(o, "model_dump") else dict(o) for o in offers]
    results = apply_sort(apply_filters(results, filters or {}), sort)
    payload = envelope_with_mode(results, provider, request_id, "train")
    await cache.set(key, payload, ttl_seconds=180)
    observe("trains", provider.name, now_ms() - started, len(results), "SUCCESS", request_id)
    return payload
