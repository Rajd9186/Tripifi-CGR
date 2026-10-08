"""Activity search service. Demo catalog or Overpass discovery — booking assisted."""

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


async def search_activities(params: dict, request_id: str) -> dict:
    destination = (params.get("destination") or "").strip()
    if not destination:
        raise SearchError("INVALID_SEARCH", "Destination is required.")
    cache = get_cache()
    key = cache_key("activities", {"destination": destination})
    cached = await cache.get(key)
    if cached is not None:
        provider_name = ((cached.get("data") or {}).get("provider") or {}).get("name", "?")
        observe("activities", provider_name, 0, cached_count(cached), "CACHE_HIT", request_id)
        return cached

    async def fetch(provider):
        return await provider.search(destination)

    started = now_ms()
    offers, provider = await run_chain("activity", fetch)
    results = [o.model_dump() if hasattr(o, "model_dump") else dict(o) for o in offers]
    payload = envelope_with_mode(results, provider, request_id, "activity")
    await cache.set(key, payload, ttl_seconds=600)
    observe("activities", provider.name, now_ms() - started, len(results), "SUCCESS", request_id)
    return payload
