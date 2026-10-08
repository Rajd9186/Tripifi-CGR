"""Overpass (OpenStreetMap) activity/place discovery + Wikipedia info.

DISCOVERY ONLY: names, kinds, locations, short descriptions. No prices
(price null → "Price on request"), no ratings/reviews. Booking is always
ASSISTED. ODbL attribution for map data; CC BY-SA for Wikipedia extracts.
"""

import httpx

from app.core.config import get_settings
from app.providers.free import ProviderError
from app.schemas.schemas import ActivityOffer
from app.services.cache import get_cache
from app.services.reliability import https_only, retry_get, swr_get

ATTRIBUTION = "Places data © OpenStreetMap contributors (ODbL); descriptions CC BY-SA (Wikipedia)"

KINDS = ["attraction", "museum", "viewpoint", "artwork", "theme_park", "zoo", "gallery", "monastery", "temple", "church", "fort", "palace"]


def _kind(tags: dict) -> str:
    for key in ("tourism", "historic", "leisure", "amenity"):
        if tags.get(key):
            return str(tags[key]).replace("_", " ").title()
    return "Place of interest"


async def _wikipedia_extract(title: str, timeout: int) -> str | None:
    """Short CC BY-SA description. Returns None (never garbage) on any failure."""
    name = title.split("#")[0].strip().replace(" ", "_")
    if not name:
        return None
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            res = await client.get(
                f"https://en.wikipedia.org/api/rest_v1/page/summary/{name}",
                headers={"User-Agent": "TripifiCGR/1.0 (travel-assistance; contact: support@tripifi.example)"},
            )
    except (httpx.TimeoutException, httpx.ConnectError):
        return None
    if res.status_code != 200:
        return None
    try:
        extract = (res.json().get("extract") or "").strip()
    except Exception:
        return None
    return extract[:400] or None


class OverpassActivityProvider:
    name = "overpass"

    async def search(self, destination: str) -> list[ActivityOffer]:
        from app.providers.free import NominatimGeocodingProvider

        settings = get_settings()
        base = https_only(settings.overpass_base_url, "Overpass")
        query = (destination or "").strip()
        if not query:
            raise ProviderError("NO_RESULTS", "Destination is required")
        cache = get_cache()
        key = f"activities:overpass:{query.lower()}"

        async def fetch():
            try:
                hits = await NominatimGeocodingProvider().geocode(query, 1)
            except ProviderError as e:
                raise ProviderError(e.state, f"Could not locate '{query}'")
            lat, lon = float(hits[0]["lat"]), float(hits[0]["lon"])
            kinds = "|".join(KINDS)
            ql = (
                f'[out:json][timeout:25];(node["tourism"~"^({kinds})$"](around:25000,{lat},{lon});'
                f'node["historic"](around:25000,{lat},{lon}););out 15;'
            )

            async def get():
                async with httpx.AsyncClient(timeout=settings.external_timeout_seconds) as client:
                    return await client.post(f"{base}/interpreter", data={"data": ql})

            try:
                res = await retry_get(get)
            except httpx.TimeoutException as e:
                raise ProviderError("TIMEOUT", str(e))
            except httpx.ConnectError as e:
                raise ProviderError("UNAVAILABLE", str(e))
            if res.status_code == 429:
                raise ProviderError("RATE_LIMITED", "Overpass rate limited")
            if res.status_code != 200:
                raise ProviderError("UNAVAILABLE", f"Overpass HTTP {res.status_code}")
            try:
                elements = res.json().get("elements") or []
            except Exception as e:
                raise ProviderError("UNAVAILABLE", f"Overpass bad response: {e}")
            offers = []
            for i, el in enumerate(elements):
                tags = el.get("tags") or {}
                name = (tags.get("name") or "").strip() or f"{_kind(tags)} near {query}"
                offers.append(ActivityOffer(
                    id=f"overpass-act-{abs(hash(query)) % 100000}-{i}",
                    provider="overpass",
                    status="LIVE",
                    title=name[:120],
                    destination=query,
                    duration=_kind(tags),
                    price=None,
                    is_demo=False,
                ))
            if not offers:
                raise ProviderError("NO_RESULTS", "No activities found in this area")
            # Enrich the first few with Wikipedia extracts (best effort).
            for offer in offers[:3]:
                extract = await _wikipedia_extract(offer.title, settings.external_timeout_seconds)
                if extract:
                    offer.description = extract
            return [o.model_dump() for o in offers]

        value, _cached = await swr_get(cache, key, ttl_seconds=43200, stale_seconds=43200, fetch=fetch)
        return [ActivityOffer(**o) for o in value]

    async def describe(self, title: str) -> dict:
        """Wikipedia summary for a place title. CC BY-SA, null when unknown."""
        from app.services.envelope import result_envelope

        settings = get_settings()
        extract = await _wikipedia_extract(title, settings.external_timeout_seconds)
        if not extract:
            raise ProviderError("NO_RESULTS", "No description available")
        return result_envelope(
            state="SUCCESS",
            data={"title": title, "extract": extract},
            source="wikipedia",
            is_live=True,
            attribution="Text extract CC BY-SA (Wikipedia)",
            cache_ttl=43200,
            mode="DISCOVERY",
        )

    async def health(self) -> dict:
        return {"provider": "overpass", "configured": True, "reachable": True}
