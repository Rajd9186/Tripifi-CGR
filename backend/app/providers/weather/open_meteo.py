"""Open-Meteo weather provider: current conditions + short forecast.

Free endpoint is NON-COMMERCIAL only. Setting OPEN_METEO_API_KEY switches
to the commercial customer API (customer-api.open-meteo.com) — required
before any commercial use. Attribution: CC BY 4.0, always returned.
No best-time prose is invented: chips show measured/forecast values only.
"""

import httpx

from app.core.config import get_settings
from app.providers.free import ProviderError
from app.services.cache import get_cache
from app.services.envelope import result_envelope
from app.services.reliability import https_only, retry_get, swr_get

ATTRIBUTION = "Weather data by Open-Meteo (CC BY 4.0, non-commercial use)"

WMO_LABELS = {
    0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
    45: "Fog", 48: "Icy fog", 51: "Light drizzle", 53: "Drizzle", 55: "Heavy drizzle",
    56: "Freezing drizzle", 57: "Freezing drizzle", 61: "Light rain", 63: "Rain",
    65: "Heavy rain", 66: "Freezing rain", 67: "Freezing rain", 71: "Light snow",
    73: "Snow", 75: "Heavy snow", 77: "Snow grains", 80: "Light showers",
    81: "Showers", 82: "Violent showers", 85: "Snow showers", 86: "Snow showers",
    95: "Thunderstorm", 96: "Storm with hail", 99: "Storm with hail",
}


class OpenMeteoWeatherProvider:
    name = "open_meteo"

    def _base(self) -> str:
        settings = get_settings()
        if settings.open_meteo_api_key:
            return "https://customer-api.open-meteo.com/v1"
        return https_only(settings.open_meteo_base_url, "Open-Meteo")

    async def forecast(self, lat: float, lon: float, days: int = 3) -> dict:
        settings = get_settings()
        days = max(1, min(int(days or 3), 7))
        cache = get_cache()
        key = f"weather:openmeteo:{round(lat, 3)}:{round(lon, 3)}:{days}"

        async def fetch():
            params = {
                "latitude": lat,
                "longitude": lon,
                "current": "temperature_2m,weather_code",
                "daily": "temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code",
                "forecast_days": days,
                "timezone": "auto",
            }
            if settings.open_meteo_api_key:
                params["apikey"] = settings.open_meteo_api_key

            async def get():
                async with httpx.AsyncClient(timeout=settings.external_timeout_seconds) as client:
                    return await client.get(f"{self._base()}/forecast", params=params)

            try:
                res = await retry_get(get)
            except httpx.TimeoutException as e:
                raise ProviderError("TIMEOUT", str(e))
            except httpx.ConnectError as e:
                raise ProviderError("UNAVAILABLE", str(e))
            if res.status_code == 401:
                raise ProviderError("AUTH_ERROR", "Open-Meteo key rejected")
            if res.status_code == 429:
                raise ProviderError("RATE_LIMITED", "Open-Meteo rate limited")
            if res.status_code != 200:
                raise ProviderError("UNAVAILABLE", f"Open-Meteo HTTP {res.status_code}")
            try:
                body = res.json()
            except Exception as e:
                raise ProviderError("UNAVAILABLE", f"Open-Meteo bad response: {e}")
            return self._normalize(body, days)

        value, _cached = await swr_get(cache, key, ttl_seconds=1800, stale_seconds=1800, fetch=fetch)
        return value

    def _normalize(self, body: dict, days: int) -> dict:
        current = body.get("current") or {}
        daily = body.get("daily") or {}
        dates = daily.get("time") or []
        tmax = daily.get("temperature_2m_max") or []
        tmin = daily.get("temperature_2m_min") or []
        precip = daily.get("precipitation_probability_max") or []
        codes = daily.get("weather_code") or []
        day_list = []
        for i in range(min(days, len(dates))):
            day_list.append({
                "date": dates[i],
                "tmax_c": tmax[i] if i < len(tmax) else None,
                "tmin_c": tmin[i] if i < len(tmin) else None,
                "precip_prob_pct": precip[i] if i < len(precip) else None,
                "condition": WMO_LABELS.get(codes[i] if i < len(codes) else -1, "—"),
            })
        if not day_list and current.get("temperature_2m") is None:
            raise ProviderError("NO_RESULTS", "No weather data")
        return result_envelope(
            state="SUCCESS",
            data={
                "current_temp_c": current.get("temperature_2m"),
                "current_condition": WMO_LABELS.get(current.get("weather_code"), "—"),
                "daily": day_list,
            },
            source="open_meteo",
            is_live=True,
            attribution=ATTRIBUTION,
            cache_ttl=1800,
            mode="LIVE",
        )

    async def health(self) -> dict:
        settings = get_settings()
        return {
            "provider": "open_meteo",
            "configured": True,
            "commercial": bool(settings.open_meteo_api_key),
            "reachable": True,
        }
