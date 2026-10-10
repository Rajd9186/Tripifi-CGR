"""SerpApi Google-Hotels provider: mapping, errors, quota guard. HTTP stubbed."""

import asyncio

import pytest

from app.core.config import get_settings
from app.providers.free import ProviderError
from app.providers.hotels.serpapi import SerpApiHotelProvider


class FakeResponse:
    def __init__(self, status_code, payload):
        self.status_code = status_code
        self._payload = payload

    def json(self):
        return self._payload


class FakeClient:
    behavior = None
    seen = {}

    def __init__(self, *args, **kwargs):
        pass

    async def __aenter__(self):
        return self

    async def __aexit__(self, *args):
        return False

    async def get(self, url, params=None, headers=None):
        FakeClient.seen = {"url": url, "params": params}
        outcome = FakeClient.behavior
        if isinstance(outcome, Exception):
            raise outcome
        return outcome


@pytest.fixture(autouse=True)
def _stub(monkeypatch):
    import httpx

    FakeClient.behavior = None
    FakeClient.seen = {}
    monkeypatch.setattr(httpx, "AsyncClient", FakeClient)
    monkeypatch.setenv("SERPAPI_API_KEY", "test-serp-key")
    monkeypatch.setenv("SERPAPI_MONTHLY_QUOTA", "100")
    get_settings.cache_clear()
    yield
    get_settings.cache_clear()


def run(coro):
    return asyncio.run(coro)


def payload():
    return {
        "properties": [
            {
                "name": "The Grand Himalaya",
                "overall_rating": 4.7,
                "reviews": 1284,
                "price": "₹6,800",
                "amenities": ["WiFi", "Breakfast", "Heater"],
                "gps_coordinates": {"latitude": 27.331, "longitude": 88.613},
            },
            {
                "name": "Hillside Lodge",
                "overall_rating": None,
                "price": None,
                "amenities": [],
            },
        ]
    }


def test_search_maps_offers():
    FakeClient.behavior = FakeResponse(200, payload())
    offers = run(SerpApiHotelProvider().search("Gangtok", "2026-12-10", "2026-12-12"))
    assert len(offers) == 2
    first, second = offers
    assert first.provider == "serpapi-hotels" and first.is_demo is False and first.status == "LIVE"
    assert first.name == "The Grand Himalaya" and first.rating == 4.7
    assert (first.nightly_price, first.price_per_night) == (6800, 6800)
    assert first.total_price is None and first.room_type is None
    assert first.location.startswith("27.331")
    assert second.rating is None and second.nightly_price is None and second.location == "Gangtok"
    params = FakeClient.seen["params"]
    assert params["engine"] == "google_hotels" and params["currency"] == "INR"
    assert params["q"] == "hotels in Gangtok"
    assert params["check_in_date"] == "2026-12-10" and params["check_out_date"] == "2026-12-12"
    assert FakeClient.seen["url"].endswith("/search")


def test_missing_key_and_destination():
    import os

    os.environ.pop("SERPAPI_API_KEY", None)
    get_settings.cache_clear()
    with pytest.raises(ProviderError) as e:
        run(SerpApiHotelProvider().search("Gangtok", None, None))
    assert e.value.state == "NOT_SUPPORTED"
    os.environ["SERPAPI_API_KEY"] = "test-serp-key"
    get_settings.cache_clear()
    with pytest.raises(ProviderError) as e:
        run(SerpApiHotelProvider().search("", None, None))
    assert e.value.state == "NO_RESULTS"


def test_auth_rate_limit_and_empty():
    FakeClient.behavior = FakeResponse(403, {})
    with pytest.raises(ProviderError) as e:
        run(SerpApiHotelProvider().search("Goa", None, None))
    assert e.value.state == "AUTH_ERROR"
    FakeClient.behavior = FakeResponse(200, {"error": "Bad request"})
    with pytest.raises(ProviderError):
        run(SerpApiHotelProvider().search("Goa", None, None))
    FakeClient.behavior = FakeResponse(200, {"properties": []})
    with pytest.raises(ProviderError) as e:
        run(SerpApiHotelProvider().search("Goa", None, None))
    assert e.value.state == "NO_RESULTS"


def test_registry_and_capability_wiring(monkeypatch):
    from app.providers import registry
    from app.services import capability

    monkeypatch.setenv("HOTEL_PROVIDER", "serpapi-hotels,overpass")
    get_settings.cache_clear()
    try:
        assert [p.name for p in registry.get_provider_chain("hotel")] == ["serpapi-hotels", "overpass"]
        assert capability.service_mode("hotel")["mode"] == "LIVE"
    finally:
        get_settings.cache_clear()
