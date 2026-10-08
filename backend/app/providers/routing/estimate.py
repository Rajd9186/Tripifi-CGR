"""Estimate routing fallback: haversine distance x 1.3 road factor.

Used when OSRM is unreachable or unconfigured. ALWAYS labelled ESTIMATE —
never presented as a measured route.
"""

import math

from app.services.envelope import result_envelope

ATTRIBUTION = "Haversine estimate x1.3 road factor — not a measured route"
ROAD_FACTOR = 1.3
AVG_SPEED_KMPH = 45.0


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    r = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dlambda / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


def estimate_from_coords(o: tuple[float, float], d: tuple[float, float]) -> dict:
    distance_km = round(haversine_km(o[0], o[1], d[0], d[1]) * ROAD_FACTOR, 1)
    return result_envelope(
        state="SUCCESS",
        data={
            "distance_km": distance_km,
            "duration_minutes": round(distance_km / AVG_SPEED_KMPH * 60),
            "provider": "estimate",
            "is_demo": False,
        },
        source="estimate",
        is_live=False,
        is_estimate=True,
        attribution=ATTRIBUTION,
        cache_ttl=86400,
        mode="ESTIMATE",
    )


class EstimateRoutingProvider:
    name = "estimate"

    @staticmethod
    def _parse(point: str) -> tuple[float, float] | None:
        try:
            lat_s, lon_s = point.split(",")
            return float(lat_s.strip()), float(lon_s.strip())
        except Exception:
            return None

    async def calculate_route(self, origin: str, destination: str) -> dict:
        from app.providers.free import ProviderError

        o, d = self._parse(origin), self._parse(destination)
        if o is None or d is None:
            raise ProviderError("NOT_SUPPORTED", "Estimate routing needs lat,lon coordinates — geocode first")
        return estimate_from_coords(o, d)

    async def calculate_distance(self, origin: str, destination: str) -> dict:
        route = await self.calculate_route(origin, destination)
        data = route["data"]
        return {
            "distance_km": data["distance_km"],
            "duration_minutes": data["duration_minutes"],
            "is_demo": False,
            "provider": "estimate",
        }
