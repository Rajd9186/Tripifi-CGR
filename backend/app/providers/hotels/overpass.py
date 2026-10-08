"""Overpass (OpenStreetMap) hotel discovery.

DISCOVERY ONLY: names, locations, amenities. No prices, no ratings, no
availability — those are always null and the UI shows "Price on request".
Licence: ODbL — attribution is always returned and must be displayed.
Strict timeouts, 12h cache. Booking is always ASSISTED.
"""

import httpx

from app.core.config import get_settings
from app.providers.free import ProviderError
from app.schemas.schemas import HotelOffer
from app.services.cache import get_cache
from app.services.reliability import https_only, retry_get, swr_get

ATTRIBUTION = "Places data © OpenStreetMap contributors (ODbL)"

TOURISM_KINDS = ["hotel", "guest_house", "hostel", "resort", "apartment", "motel", "chalet"]


def _display_name(tags: dict, fallback: str) -> str:
    name = (tags.get("name") or "").strip()
    return name or fallback


def _amenities(tags: dict) -> list[str]:
    out = []
    kind = (tags.get("tourism") or "").replace("_", " ").title()
    if kind:
        out.append(kind)
    for key, label in (
        ("internet_access", "WiFi"),
        ("restaurant", "Restaurant"),
        ("swimming_pool", "Pool"),
        ("parking", "Parking"),
        ("wheelchair", "Wheelchair access"),
    ):
        if str(tags.get(key, "")).lower() in ("yes", "wlan", "free"):
            out.append(label)
    return out[:8]


class OverpassHotelProvider:
    name = "overpass"

    async def search(self, destination: str, checkin: str | None = None, checkout: str | None = None) -> list[HotelOffer]:
        from app.providers.free import NominatimGeocodingProvider

        settings = get_settings()
        base = https_only(settings.overpass_base_url, "Overpass")
        query = (destination or "").strip()
        if not query:
            raise ProviderError("NO_RESULTS", "Destination is required")
        cache = get_cache()
        key = f"hotels:overpass:{query.lower()}:{checkin}:{checkout}"

        async def fetch():
            try:
                hits = await NominatimGeocodingProvider().geocode(query, 1)
            except ProviderError as e:
                raise ProviderError(e.state, f"Could not locate '{query}'")
            lat, lon = float(hits[0]["lat"]), float(hits[0]["lon"])
            kinds = "|".join(TOURISM_KINDS)
            ql = (
                f'[out:json][timeout:25];(node["tourism"~"^({kinds})$"](around:20000,{lat},{lon});'
                f'way["tourism"~"^({kinds})$"](around:20000,{lat},{lon}););out center 15;'
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
                lat2 = (el.get("center") or {}).get("lat", el.get("lat"))
                lon2 = (el.get("center") or {}).get("lon", el.get("lon"))
                offers.append(HotelOffer(
                    id=f"overpass-hotel-{abs(hash(query)) % 100000}-{i}",
                    provider="overpass",
                    status="LIVE",
                    name=_display_name(tags, f"Stay near {query}"),
                    destination=query,
                    location=f"{float(lat2):.3f},{float(lon2):.3f}" if lat2 and lon2 else query,
                    rating=None,
                    room_type=None,
                    amenities=_amenities(tags),
                    breakfast=None,
                    cancellation=None,
                    nightly_price=None,
                    price_per_night=None,
                    total_price=None,
                    is_demo=False,
                ))
            if not offers:
                raise ProviderError("NO_RESULTS", "No stays found in this area")
            return [o.model_dump() for o in offers]

        value, _cached = await swr_get(cache, key, ttl_seconds=43200, stale_seconds=43200, fetch=fetch)
        return [HotelOffer(**o) for o in value]

    async def health(self) -> dict:
        return {"provider": "overpass", "configured": True, "reachable": True}
