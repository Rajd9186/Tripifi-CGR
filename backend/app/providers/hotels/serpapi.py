"""Hotels via SerpApi Google Hotels: live listings with as-reported prices.

Key from https://serpapi.com/users/sign_up (server-side only). Shares the
SerpApi monthly quota guard with flights (one pool: SERPAPI_MONTHLY_QUOTA).
Prices are Google Hotels nightly rates in INR — real but volatile, so offers
are search-time snapshots; booking always goes through assisted enquiry.
"""

import re

import httpx

from app.core.config import get_settings
from app.providers.free import ProviderError
from app.schemas.schemas import HotelOffer


def _inr(value: object) -> int | None:
    if value is None:
        return None
    digits = re.sub(r"[^\d]", "", str(value))
    try:
        amount = int(digits) if digits else 0
    except ValueError:
        return None
    return amount if amount > 0 else None


def _rating(value: object) -> float | None:
    try:
        rating = float(value)
    except (TypeError, ValueError):
        return None
    return rating if 0 < rating <= 5 else None


class SerpApiHotelProvider:
    """Live Google Hotels results. Names/ratings/prices as reported; nothing
    booked or confirmed — is_demo False, booking assisted."""

    name = "serpapi-hotels"

    async def search(self, destination: str, checkin: str | None = None, checkout: str | None = None) -> list[HotelOffer]:
        from app.services.reliability import https_only, quota_check, quota_consume, quota_remaining, retry_get

        settings = get_settings()
        if not settings.serpapi_api_key:
            raise ProviderError("NOT_SUPPORTED", "Google Hotels lookup needs a SerpApi key")
        query = (destination or "").strip()
        if not query:
            raise ProviderError("NO_RESULTS", "Destination is required")
        quota_check("serpapi", settings.serpapi_monthly_quota)
        base = https_only(settings.serpapi_base_url, "SerpApi")

        params: dict[str, object] = {
            "engine": "google_hotels",
            "api_key": settings.serpapi_api_key,
            "q": f"hotels in {query}",
            "currency": "INR",
            "gl": "in",
            "hl": "en",
            "adults": 2,
        }
        if checkin:
            params["check_in_date"] = checkin
        if checkout:
            params["check_out_date"] = checkout

        async def fetch():
            async with httpx.AsyncClient(timeout=settings.external_timeout_seconds) as client:
                return await client.get(f"{base}/search", params=params)

        try:
            res = await retry_get(fetch)
        except httpx.TimeoutException as e:
            raise ProviderError("TIMEOUT", str(e))
        except httpx.ConnectError as e:
            raise ProviderError("UNAVAILABLE", str(e))
        if res.status_code in (401, 403):
            raise ProviderError("AUTH_ERROR", "SerpApi key rejected")
        if res.status_code == 429:
            raise ProviderError("RATE_LIMITED", "SerpApi rate limited")
        if res.status_code != 200:
            raise ProviderError("UNAVAILABLE", f"SerpApi HTTP {res.status_code}")
        try:
            body = res.json()
        except Exception as e:
            raise ProviderError("UNAVAILABLE", f"SerpApi bad response: {e}")
        if isinstance(body, dict) and body.get("error"):
            raise ProviderError("UNAVAILABLE", f"SerpApi: {str(body['error'])[:120]}")
        quota_consume("serpapi")
        if quota_remaining("serpapi", settings.serpapi_monthly_quota) <= 0:
            raise ProviderError("RATE_LIMITED", "SerpApi monthly quota guard tripped")

        properties = (body.get("properties") or [])[:10]
        offers: list[HotelOffer] = []
        for i, prop in enumerate(properties):
            name = prop.get("name") or f"Stay near {query}"
            gps = prop.get("gps_coordinates") or {}
            lat, lon = gps.get("latitude"), gps.get("longitude")
            location = f"{lat:.3f},{lon:.3f}" if lat and lon else query
            nightly = _inr(prop.get("price"))
            amenities = [str(a) for a in (prop.get("amenities") or [])[:8] if a]
            offers.append(
                HotelOffer(
                    id=f"serpapi-hotel-{abs(hash(query)) % 100000}-{i}",
                    provider="serpapi-hotels",
                    status="LIVE",
                    name=name,
                    destination=query,
                    location=location,
                    rating=_rating(prop.get("overall_rating")),
                    room_type=None,  # not reported — never invented
                    amenities=amenities,
                    breakfast=None,
                    cancellation=None,
                    nightly_price=nightly,
                    price_per_night=nightly,
                    total_price=None,  # nightly snapshot only; totals via enquiry
                    is_demo=False,
                )
            )
        if not offers:
            raise ProviderError("NO_RESULTS", "No hotels returned")
        return offers

    async def health(self) -> dict:
        settings = get_settings()
        return {
            "provider": "serpapi-hotels",
            "configured": bool(settings.serpapi_api_key),
            "reachable": True,
        }
