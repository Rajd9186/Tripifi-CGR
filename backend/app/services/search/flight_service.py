"""Flight search service: validate → provider → normalize → filter/sort."""

from app.providers import registry
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


def validate(origin: str | None, destination: str | None, departure_date: str | None, travellers: int = 2) -> dict:
    from datetime import date as date_cls

    o, d = (origin or "").strip(), (destination or "").strip()
    if not o or not d:
        raise SearchError("INVALID_SEARCH", "Origin and destination are required.")
    if o.lower() == d.lower():
        raise SearchError("INVALID_SEARCH", "Origin and destination must differ.")
    if departure_date:
        try:
            y, m, day = map(int, departure_date.split("-"))
            if date_cls(y, m, day) < date_cls.today():
                raise SearchError("INVALID_SEARCH", "Departure date cannot be in the past.")
        except SearchError:
            raise
        except Exception:
            raise SearchError("INVALID_SEARCH", "Departure date must be YYYY-MM-DD.")
    if (travellers or 0) < 1:
        raise SearchError("INVALID_SEARCH", "Travellers must be at least 1.")
    return {"origin": o, "destination": d, "departure_date": departure_date, "travellers": travellers or 2}


def apply_filters(offers: list[dict], filters: dict) -> list[dict]:
    out = list(offers)
    if filters.get("max_price") is not None:
        # Unknown fares can't be verified under budget — exclude them.
        out = [o for o in out if o.get("fare") is not None and o["fare"] <= filters["max_price"]]
    if filters.get("airline"):
        out = [o for o in out if o.get("airline") == filters["airline"]]
    if filters.get("non_stop"):
        out = [o for o in out if (o.get("stops", 0) or 0) == 0]
    if filters.get("refundable"):
        out = [o for o in out if o.get("refundable")]
    if filters.get("max_duration") is not None:
        out = [o for o in out if (o.get("duration_minutes", 0) or 0) <= filters["max_duration"]]
    return out


def apply_sort(offers: list[dict], sort: str) -> list[dict]:
    out = list(offers)
    if sort == "cheapest":
        # Unknown fares sort last — never presented as cheapest.
        out.sort(key=lambda o: (o.get("fare") is None, o.get("fare") or 0))
    elif sort == "fastest":
        out.sort(key=lambda o: o.get("duration_minutes", 0) or 0)
    elif sort == "earliest":
        out.sort(key=lambda o: str(o.get("departure", "")))
    return out


async def search_flights(params: dict, request_id: str, filters: dict | None = None, sort: str = "recommended") -> dict:
    v = validate(params.get("origin"), params.get("destination"), params.get("departure_date"), int(params.get("travellers", 2) or 2))
    cache = get_cache()
    key = cache_key("flights", {**v, "filters": filters or {}, "sort": sort})
    cached = await cache.get(key)
    if cached is not None:
        provider_name = ((cached.get("data") or {}).get("provider") or {}).get("name", "?")
        observe("flights", provider_name, 0, cached_count(cached), "CACHE_HIT", request_id)
        return cached

    async def fetch(provider):
        return await provider.search(v["origin"], v["destination"], v["departure_date"], v["travellers"])

    started = now_ms()
    offers, provider = await run_chain("flight", fetch)
    results = [o.model_dump() if hasattr(o, "model_dump") else dict(o) for o in offers]
    results = apply_sort(apply_filters(results, filters or {}), sort)
    payload = envelope_with_mode(results, provider, request_id, "flight")
    await cache.set(key, payload, ttl_seconds=120)
    observe("flights", provider.name, now_ms() - started, len(results), "SUCCESS", request_id)
    return payload
