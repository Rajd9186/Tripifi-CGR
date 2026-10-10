"""Google Flights via SerpApi: live fares + schedules (no booking, no availability).

Key from https://serpapi.com/users/sign_up (free tier is limited — check
https://serpapi.com/pricing). Key stays server-side. A persisted monthly
quota guard stops at 90% of SERPAPI_MONTHLY_QUOTA so the free allowance is
never burned through. Booking always goes through the assisted-enquiry flow.
"""

import re
from datetime import date as date_cls

import httpx

from app.core.config import get_settings
from app.providers.free import ProviderError
from app.schemas.schemas import FlightOffer


def _iata(value: str) -> str | None:
    text = (value or "").strip()
    m = re.search(r"\(([A-Za-z]{3})\)", text)
    if m:
        return m.group(1).upper()
    if re.fullmatch(r"[A-Za-z]{3}", text):
        return text.upper()
    return None


def _minutes(value: object) -> int:
    try:
        return max(0, int(value or 0))
    except (TypeError, ValueError):
        return 0


def _inr(value: object) -> int | None:
    try:
        amount = int(float(value))
    except (TypeError, ValueError):
        return None
    return amount if amount > 0 else None


class SerpApiFlightProvider:
    """Live Google Flights results. Fares are as-reported (INR), seats NOT
    confirmed — seat_available stays False and booking stays assisted."""

    name = "serpapi"

    async def search(self, origin: str, destination: str, date: str | None, travellers: int = 2) -> list[FlightOffer]:
        from app.services.reliability import https_only, quota_check, quota_consume, quota_remaining, retry_get

        settings = get_settings()
        if not settings.serpapi_api_key:
            raise ProviderError("NOT_SUPPORTED", "Google Flights lookup needs a SerpApi key")
        dep, arr = _iata(origin), _iata(destination)
        if not dep or not arr:
            raise ProviderError("NO_RESULTS", f"Could not resolve airport codes for '{origin}' → '{destination}'")
        quota_check("serpapi", settings.serpapi_monthly_quota)
        base = https_only(settings.serpapi_base_url, "SerpApi")

        params: dict[str, object] = {
            "engine": "google_flights",
            "api_key": settings.serpapi_api_key,
            "departure_id": dep,
            "arrival_id": arr,
            "type": 2,  # one way
            "currency": "INR",
            "gl": "in",
            "hl": "en",
            "adults": max(1, int(travellers or 1)),
            "sort_by": 2,  # price
        }
        if date:
            try:
                y, m, day = map(int, date.split("-"))
                if date_cls(y, m, day) < date_cls.today():
                    raise ProviderError("NO_RESULTS", "Departure date is in the past")
                params["outbound_date"] = date
            except ProviderError:
                raise
            except Exception:
                raise ProviderError("NO_RESULTS", "Departure date must be YYYY-MM-DD")

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

        options = (body.get("best_flights") or []) + (body.get("other_flights") or [])
        offers: list[FlightOffer] = []
        for i, option in enumerate(options[:10]):
            legs = option.get("flights") or []
            if not legs:
                continue
            first, last = legs[0], legs[-1]
            dep_air = first.get("departure_airport") or {}
            arr_air = last.get("arrival_airport") or {}
            airline = first.get("airline") or "Unknown airline"
            fare = _inr(option.get("price"))
            offers.append(
                FlightOffer(
                    id=f"serpapi-{dep}-{arr}-{i}",
                    provider="serpapi",
                    status="LIVE",
                    airline=airline,
                    flight_number=str(first.get("flight_number") or "—"),
                    origin=dep,
                    destination=arr,
                    departure=str(dep_air.get("time") or "—"),
                    arrival=str(arr_air.get("time") or "—"),
                    duration_minutes=_minutes(option.get("total_duration")),
                    stops=max(0, len(legs) - 1),
                    fare=fare,
                    currency="INR",
                    refundable=None,  # not reported — never claimed
                    seat_available=False,  # schedules/fares only, never confirmed seats
                    is_demo=False,
                )
            )
        if not offers:
            raise ProviderError("NO_RESULTS", "No flights returned")
        return offers

    async def health(self) -> dict:
        settings = get_settings()
        return {
            "provider": "serpapi",
            "configured": bool(settings.serpapi_api_key),
            "reachable": True,
        }
