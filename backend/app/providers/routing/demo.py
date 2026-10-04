"""Demo routing. Deterministic haversine estimates — labeled estimated, never live traffic."""

import math


def _haversine_km(a: tuple[float, float], b: tuple[float, float]) -> float:
    lat1, lon1 = math.radians(a[0]), math.radians(a[1])
    lat2, lon2 = math.radians(b[0]), math.radians(b[1])
    dlat, dlon = lat2 - lat1, lon2 - lon1
    h = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    return 2 * 6371 * math.asin(math.sqrt(h))


def _parse(point: str) -> tuple[float, float] | None:
    try:
        lat_s, lon_s = point.split(",")
        return float(lat_s.strip()), float(lon_s.strip())
    except Exception:
        return None


class DemoRoutingProvider:
    name = "demo"

    async def calculate_route(self, origin: str, destination: str) -> dict:
        o, d = _parse(origin), _parse(destination)
        if o is None or d is None:
            # Named places without coordinates: honest fallback distance.
            return {
                "origin": origin, "destination": destination,
                "distance_km": 120.0, "duration_minutes": 180,
                "provider": "demo", "is_demo": True, "estimated": True,
            }
        km = round(_haversine_km(o, d), 1)
        return {
            "origin": origin, "destination": destination,
            "distance_km": km, "duration_minutes": round(km / 40 * 60),
            "provider": "demo", "is_demo": True, "estimated": True,
        }

    async def calculate_distance(self, origin: str, destination: str) -> dict:
        route = await self.calculate_route(origin, destination)
        return {
            "distance_km": route["distance_km"],
            "duration_minutes": route["duration_minutes"],
            "provider": "demo", "is_demo": True, "estimated": True,
        }
