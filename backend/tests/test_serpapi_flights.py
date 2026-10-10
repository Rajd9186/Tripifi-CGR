"""SerpApi Google-Flights provider: mapping, errors, quota guard. HTTP stubbed."""

import asyncio

import pytest

from app.core.config import get_settings
from app.providers.flights.serpapi import SerpApiFlightProvider, _iata
from app.providers.free import ProviderError


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


def leg(dep_id, dep_time, arr_id, arr_time, airline="IndiGo", number="6E 213"):
    return {
        "departure_airport": {"id": dep_id, "time": dep_time},
        "arrival_airport": {"id": arr_id, "time": arr_time},
        "airline": airline,
        "flight_number": number,
    }


def payload():
    return {
        "best_flights": [
            {
                "flights": [leg("CCU", "2026-12-12 06:30", "DEL", "2026-12-12 09:00")],
                "total_duration": 150,
                "price": 5230,
            }
        ],
        "other_flights": [
            {
                "flights": [
                    leg("CCU", "2026-12-12 18:00", "BOM", "2026-12-12 20:30", "Air India", "AI 675"),
                    leg("BOM", "2026-12-12 22:00", "DEL", "2026-12-13 00:15", "Air India", "AI 654"),
                ],
                "total_duration": 375,
                "price": 7899,
            }
        ],
    }


def test_iata_extraction():
    assert _iata("Kolkata (CCU)") == "CCU"
    assert _iata("del") == "DEL"
    assert _iata("New Delhi") is None
    assert _iata("") is None


def test_search_maps_offers():
    FakeClient.behavior = FakeResponse(200, payload())
    offers = run(SerpApiFlightProvider().search("Kolkata (CCU)", "Delhi (DEL)", "2026-12-12", 1))
    assert len(offers) == 2
    direct, connecting = offers
    assert direct.provider == "serpapi" and direct.is_demo is False and direct.status == "LIVE"
    assert (direct.airline, direct.flight_number, direct.stops) == ("IndiGo", "6E 213", 0)
    assert (direct.fare, direct.currency) == (5230, "INR")
    assert direct.duration_minutes == 150
    assert direct.seat_available is False and direct.refundable is None
    assert (connecting.stops, connecting.fare) == (1, 7899)
    params = FakeClient.seen["params"]
    assert params["engine"] == "google_flights" and params["currency"] == "INR"
    assert params["departure_id"] == "CCU" and params["arrival_id"] == "DEL"
    assert params["outbound_date"] == "2026-12-12" and params["type"] == 2
    assert FakeClient.seen["url"].endswith("/search")


def test_missing_key_is_not_supported():
    import os

    os.environ.pop("SERPAPI_API_KEY", None)
    get_settings.cache_clear()
    with pytest.raises(ProviderError) as e:
        run(SerpApiFlightProvider().search("CCU", "DEL", None))
    assert e.value.state == "NOT_SUPPORTED"


def test_unresolvable_airports():
    FakeClient.behavior = FakeResponse(200, payload())
    with pytest.raises(ProviderError) as e:
        run(SerpApiFlightProvider().search("Kolkata", "Delhi", None))
    assert e.value.state == "NO_RESULTS"


def test_auth_and_rate_limit_mapping():
    FakeClient.behavior = FakeResponse(401, {})
    with pytest.raises(ProviderError) as e:
        run(SerpApiFlightProvider().search("CCU", "DEL", None))
    assert e.value.state == "AUTH_ERROR"
    FakeClient.behavior = FakeResponse(429, {})
    with pytest.raises(ProviderError) as e:
        run(SerpApiFlightProvider().search("CCU", "DEL", None))
    assert e.value.state == "RATE_LIMITED"


def test_serpapi_error_body_and_empty():
    FakeClient.behavior = FakeResponse(200, {"error": "Invalid departure_id"})
    with pytest.raises(ProviderError):
        run(SerpApiFlightProvider().search("CCU", "DEL", None))
    FakeClient.behavior = FakeResponse(200, {"best_flights": [], "other_flights": []})
    with pytest.raises(ProviderError) as e:
        run(SerpApiFlightProvider().search("CCU", "DEL", None))
    assert e.value.state == "NO_RESULTS"


def test_registry_and_capability_wiring(monkeypatch):
    from app.providers import registry
    from app.services import capability

    monkeypatch.setenv("FLIGHT_PROVIDER", "serpapi,aviationstack")
    get_settings.cache_clear()
    try:
        assert [p.name for p in registry.get_provider_chain("flight")] == ["serpapi", "aviationstack"]
        assert capability.service_mode("flight")["mode"] == "LIVE"
    finally:
        get_settings.cache_clear()
