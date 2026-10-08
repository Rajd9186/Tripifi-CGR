"""Demo weather provider. Clearly-marked static outlooks, never live claims."""

ATTRIBUTION = "Demo outlook — not live weather data"


class DemoWeatherProvider:
    name = "demo"

    async def forecast(self, lat: float, lon: float, days: int = 3) -> dict:
        return {
            "state": "SUCCESS",
            "data": {
                "daily": [
                    {"date": f"day-{i + 1}", "tmax_c": None, "tmin_c": None, "precip_mm": None, "code": None}
                    for i in range(max(1, min(days, 7)))
                ],
                "note": "Demo outlook. Connect Open-Meteo for live weather.",
            },
            "source": "demo",
            "is_live": False,
            "is_estimate": False,
            "fetched_at": None,
            "attribution": ATTRIBUTION,
            "cache_ttl": 300,
            "mode": "ASSISTED",
        }

    async def best_time(self, destination: str) -> dict:
        return {
            "state": "SUCCESS",
            "data": {
                "destination": destination,
                "summary": None,
                "note": "Demo outlook. Connect Open-Meteo for live best-time guidance.",
            },
            "source": "demo",
            "is_live": False,
            "is_estimate": False,
            "fetched_at": None,
            "attribution": ATTRIBUTION,
            "cache_ttl": 300,
            "mode": "ASSISTED",
        }

    async def health(self) -> dict:
        return {"provider": "demo", "configured": True, "reachable": True}
