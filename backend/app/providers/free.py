"""Free-first providers. All external calls stay server-side, cached, and replaceable.

- Nominatim (OSM): strict usage policy — server-side only, single-flight
  rate limit, app User-Agent, cached, attribution required.
- OSRM (public demo server): routing for estimates; not guaranteed for production.
- GraphHopper: dev/non-commercial only unless a commercial license is obtained.
- Aviationstack: free tier is non-commercial dev only; never expose the key.
"""

import time

import httpx

from app.core.config import get_settings
from app.schemas.schemas import FlightOffer
from app.services.cache import get_cache

APP_UA = "TripifiCGR/1.0 (travel-assistance; contact: support@tripifi.example)"


class ProviderError(Exception):
    def __init__(self, state: str, message: str = ""):
        super().__init__(message or state)
        self.state = state  # SUCCESS|NO_RESULTS|UNAVAILABLE|RATE_LIMITED|AUTH_ERROR|TIMEOUT|NOT_SUPPORTED


_last_nominatim_call = 0.0


async def _nominatim_rate_limit():
    """Public Nominatim requires max ~1 req/s. Serialize server-side calls."""
    global _last_nominatim_call
    now = time.monotonic()
    wait = 1.1 - (now - _last_nominatim_call)
    if wait > 0:
        import asyncio

        await asyncio.sleep(wait)
    _last_nominatim_call = time.monotonic()


class NominatimGeocodingProvider:
    name = "nominatim"

    async def geocode(self, query: str, limit: int = 5) -> list[dict]:
        settings = get_settings()
        cache = get_cache()
        key = f"geocode:nominatim:{query.lower().strip()}:{limit}"
        cached = await cache.get(key)
        if cached is not None:
            return cached
        await _nominatim_rate_limit()
        try:
            async with httpx.AsyncClient(timeout=8, headers={"User-Agent": APP_UA, "Referer": settings.frontend_url}) as client:
                res = await client.get(
                    f"{settings.nominatim_base_url}/search",
                    params={"q": query, "format": "jsonv2", "limit": max(1, min(limit, 5)), "countrycodes": "in"},
                )
        except httpx.TimeoutException as e:
            raise ProviderError("TIMEOUT", str(e))
        if res.status_code == 429:
            raise ProviderError("RATE_LIMITED", "Geocoding rate limited")
        if res.status_code != 200:
            raise ProviderError("UNAVAILABLE", f"Geocoding HTTP {res.status_code}")
        data = res.json()
        results = [
            {
                "name": item.get("display_name", query),
                "lat": float(item["lat"]),
                "lon": float(item["lon"]),
                "attribution": "© OpenStreetMap contributors",
            }
            for item in data
            if "lat" in item and "lon" in item
        ]
        if not results:
            raise ProviderError("NO_RESULTS", "No geocoding results")
        await cache.set(key, results, ttl_seconds=86400)
        return results


class OSRMRoutingProvider:
    name = "osrm"

    async def calculate_route(self, origin: str, destination: str) -> dict:
        return await self._route_by_coords(origin, destination)

    async def calculate_distance(self, origin: str, destination: str) -> dict:
        route = await self._route_by_coords(origin, destination)
        return {"distance_km": route["distance_km"], "duration_minutes": route["duration_minutes"], "is_demo": False, "provider": "osrm"}

    async def _route_by_coords(self, origin: str, destination: str) -> dict:
        # Coordinates keep this honest: callers should geocode first. Accept
        # "lat,lon" strings; otherwise fall back to a clearly-marked estimate.
        def parse(point: str):
            try:
                lat_s, lon_s = point.split(",")
                return float(lat_s.strip()), float(lon_s.strip())
            except Exception:
                return None

        o, d = parse(origin), parse(destination)
        if o is None or d is None:
            raise ProviderError("NOT_SUPPORTED", "OSRM routing needs lat,lon coordinates — geocode first")
        settings = get_settings()
        cache = get_cache()
        key = f"route:osrm:{o[0]},{o[1]}:{d[0]},{d[1]}"
        cached = await cache.get(key)
        if cached is not None:
            return cached
        try:
            async with httpx.AsyncClient(timeout=10, headers={"User-Agent": APP_UA}) as client:
                # OSRM expects lon,lat ordering.
                res = await client.get(
                    f"{settings.osrm_base_url}/route/v1/driving/{o[1]},{o[0]};{d[1]},{d[0]}",
                    params={"overview": "false"},
                )
        except httpx.TimeoutException as e:
            raise ProviderError("TIMEOUT", str(e))
        if res.status_code != 200:
            raise ProviderError("UNAVAILABLE", f"Routing HTTP {res.status_code}")
        routes = (res.json().get("routes") or [])
        if not routes:
            raise ProviderError("NO_RESULTS", "No route found")
        best = routes[0]
        payload = {
            "distance_km": round(best["distance"] / 1000, 1),
            "duration_minutes": round(best["duration"] / 60),
            "provider": "osrm",
            "is_demo": False,
        }
        await cache.set(payload_key(key), payload, ttl_seconds=86400)
        return payload


def payload_key(key: str) -> str:
    return key


class GraphHopperRoutingProvider:
    """Dev/non-commercial only unless a commercial license is obtained."""

    name = "graphhopper"

    async def calculate_route(self, origin: str, destination: str) -> dict:
        raise ProviderError("NOT_SUPPORTED", "GraphHopper is not configured (needs commercial license for production)")

    async def calculate_distance(self, origin: str, destination: str) -> dict:
        raise ProviderError("NOT_SUPPORTED", "GraphHopper is not configured (needs commercial license for production)")


class AviationstackFlightProvider:
    """Non-commercial dev only on the free tier. Schedules, not bookings."""

    name = "aviationstack"

    async def search(self, origin: str, destination: str, date: str | None, travellers: int = 2) -> list[FlightOffer]:
        settings = get_settings()
        if not settings.aviation_api_key:
            raise ProviderError("NOT_SUPPORTED", "Aviationstack not configured")
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                res = await client.get(
                    "http://api.aviationstack.com/v1/flights",
                    params={
                        "access_key": settings.aviation_api_key,
                        "dep_iata": origin.upper(),
                        "arr_iata": destination.upper(),
                        "limit": 20,
                    },
                )
        except httpx.TimeoutException as e:
            raise ProviderError("TIMEOUT", str(e))
        if res.status_code == 401:
            raise ProviderError("AUTH_ERROR", "Aviationstack key rejected")
        if res.status_code == 429:
            raise ProviderError("RATE_LIMITED", "Aviationstack rate limited")
        if res.status_code != 200:
            raise ProviderError("UNAVAILABLE", f"Aviationstack HTTP {res.status_code}")
        offers: list[FlightOffer] = []
        for i, item in enumerate((res.json().get("data") or [])[:10]):
            dep = (item.get("departure") or {})
            arr = (item.get("arrival") or {})
            airline = ((item.get("airline") or {}).get("name")) or "Unknown airline"
            offers.append(
                FlightOffer(
                    id=f"aviationstack-{origin}-{destination}-{i}",
                    provider="aviationstack",
                    airline=airline,
                    flight_number=str((item.get("flight") or {}).get("iata") or "—"),
                    origin=origin.upper(),
                    destination=destination.upper(),
                    departure=str(dep.get("scheduled") or dep.get("estimated") or "—"),
                    arrival=str(arr.get("scheduled") or arr.get("estimated") or "—"),
                    duration_minutes=0,
                    stops=0,
                    fare=0,  # Aviationstack free tier has no fares — never invent one.
                    refundable=False,
                    seat_available=False,
                    is_demo=False,
                )
            )
        if not offers:
            raise ProviderError("NO_RESULTS", "No flights returned")
        return offers

    async def get_details(self, offer_id: str) -> FlightOffer | None:
        return None
