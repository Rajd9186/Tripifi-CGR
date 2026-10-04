"""Activity search service over the demo activity catalog."""

from app.providers import registry
from app.services.cache import get_cache
from app.services.search.base import SearchError, cache_key, cached_count, envelope, now_ms, observe


async def search_activities(params: dict, request_id: str) -> dict:
    destination = (params.get("destination") or "").strip()
    if not destination:
        raise SearchError("INVALID_SEARCH", "Destination is required.")
    provider = registry.get_activity_provider()
    cache = get_cache()
    key = cache_key("activities", {"destination": destination})
    cached = await cache.get(key)
    if cached is not None:
        observe("activities", provider.name, 0, cached_count(cached), "CACHE_HIT", request_id)
        return cached
    started = now_ms()
    try:
        offers = await provider.search(destination)
    except Exception as e:
        observe("activities", provider.name, now_ms() - started, 0, "ERROR", request_id)
        raise SearchError("PROVIDER_UNAVAILABLE", str(e))
    results = [o.model_dump() if hasattr(o, "model_dump") else dict(o) for o in offers]
    payload = envelope(results, {"name": provider.name, "status": "DEMO"}, request_id)
    await cache.set(key, payload, ttl_seconds=600)
    observe("activities", provider.name, now_ms() - started, len(results), "SUCCESS", request_id)
    return payload
