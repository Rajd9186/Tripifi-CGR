"""Phase (c): capability matrix, fallback chains, endpoint modes. Mocks only."""

import asyncio

import pytest
from fastapi.testclient import TestClient

from app.core.config import get_settings


def run(coro):
    return asyncio.run(coro)


@pytest.fixture()
def _env(monkeypatch):
    monkeypatch.setenv("AI_PROVIDER", "groq")
    get_settings.cache_clear()
    yield
    get_settings.cache_clear()


def test_capability_matrix_modes(_env, monkeypatch):
    from app.services import capability

    monkeypatch.setenv("FLIGHT_PROVIDER", "demo")
    monkeypatch.setenv("HOTEL_PROVIDER", "demo")
    monkeypatch.setenv("CAB_PROVIDER", "demo")
    monkeypatch.setenv("TRAIN_PROVIDER", "demo")
    monkeypatch.setenv("ROUTING_PROVIDER", "demo")
    monkeypatch.setenv("WEATHER_PROVIDER", "demo")
    get_settings.cache_clear()
    try:
        matrix = capability.service_matrix()
        assert matrix["packages"]["mode"] == "LIVE"
        assert matrix["packages"]["bookable"] is True
        assert matrix["flight"]["mode"] == "ASSISTED"
        assert matrix["cab"]["mode"] == "ESTIMATE"
        assert matrix["cab"]["estimate"] is True
        assert matrix["train"]["mode"] == "SCHEDULE_ONLY"
        for service, row in matrix.items():
            assert row["mode"] in ("LIVE", "ESTIMATE", "SCHEDULE_ONLY", "DISCOVERY", "ASSISTED")
            assert "source" in row and "reason" in row
            for flag in ("live_data", "estimate", "schedule_only", "bookable", "assisted"):
                assert isinstance(row[flag], bool)
    finally:
        get_settings.cache_clear()


def test_capability_live_mappings(_env, monkeypatch):
    from app.services import capability

    monkeypatch.setenv("HOTEL_PROVIDER", "overpass")
    monkeypatch.setenv("ROUTING_PROVIDER", "osrm")
    monkeypatch.setenv("WEATHER_PROVIDER", "open_meteo")
    monkeypatch.setenv("FLIGHT_PROVIDER", "aviationstack")
    monkeypatch.setenv("AVIATION_API_KEY", "k")
    monkeypatch.setenv("AVIATIONSTACK_PAID_KEY", "true")
    get_settings.cache_clear()
    try:
        matrix = capability.service_matrix()
        assert matrix["hotel"]["mode"] == "DISCOVERY"
        assert matrix["hotel"]["live_data"] is True
        assert matrix["routing"]["mode"] == "LIVE"
        assert matrix["weather"]["mode"] == "LIVE"
        assert matrix["flight"]["mode"] == "SCHEDULE_ONLY"
        assert matrix["flight"]["schedule_only"] is True
    finally:
        get_settings.cache_clear()


def test_chain_falls_forward(_env):
    from app.providers.free import ProviderError
    from app.services.search.base import run_chain

    calls = []

    class Fail:
        name = "fail"

    class Win:
        name = "win"

    import app.providers.registry as reg

    orig = reg.get_provider_chain
    reg.get_provider_chain = lambda service: [Fail(), Win()]
    try:
        async def fetch(provider):
            calls.append(provider.name)
            if provider.name == "fail":
                raise ProviderError("TIMEOUT", "down")
            return [{"id": "1"}]

        offers, provider = run(run_chain("flight", fetch))
        assert offers == [{"id": "1"}] and provider.name == "win"
        assert calls == ["fail", "win"]
    finally:
        reg.get_provider_chain = orig


def test_chain_stops_at_no_results(_env):
    from app.providers.free import ProviderError
    from app.services.search.base import run_chain

    import app.providers.registry as reg

    orig = reg.get_provider_chain
    reg.get_provider_chain = lambda service: [type("P", (), {"name": "p1"})()]

    async def fetch(provider):
        raise ProviderError("NO_RESULTS", "empty")

    try:
        offers, provider = run(run_chain("hotel", fetch))
        assert offers == [] and provider.name == "p1"
    finally:
        reg.get_provider_chain = orig


def test_chain_disabled_raises_unavailable(_env):
    from app.services.search.base import SearchError, run_chain

    import app.providers.registry as reg

    orig = reg.get_provider_chain
    reg.get_provider_chain = lambda service: [type("D", (), {"name": "disabled"})()]
    try:
        with pytest.raises(SearchError) as e:
            run(run_chain("cab", lambda p: []))
        assert e.value.code == "PROVIDER_UNAVAILABLE"
    finally:
        reg.get_provider_chain = orig


def test_search_envelope_has_mode_source_fetched_at(_env, monkeypatch):
    from app.services.search import flight_service

    # Service-logic test pins demo explicitly; production default is live-only.
    monkeypatch.setenv("FLIGHT_PROVIDER", "demo")
    get_settings.cache_clear()
    try:
        payload = run(flight_service.search_flights(
            {"origin": "CCU", "destination": "DEL", "departure_date": "2099-11-10"}, "t1"))
    finally:
        get_settings.cache_clear()
    data = payload["data"]
    assert data["mode"] == "ASSISTED"
    assert data["source"] == "demo"
    assert data["fetched_at"]
    assert data["provider"] == {"name": "demo", "status": "DEMO"}


def test_contract_no_fabrication_when_disabled(_env, monkeypatch):
    """Disabled/unsupported providers yield errors, never invented inventory."""
    from app.services.search import cab_service, flight_service, hotel_service, train_service
    from app.services.search.base import SearchError

    monkeypatch.setenv("FLIGHT_PROVIDER", "disabled")
    monkeypatch.setenv("TRAIN_PROVIDER", "disabled")
    monkeypatch.setenv("HOTEL_PROVIDER", "disabled")
    monkeypatch.setenv("CAB_PROVIDER", "disabled")
    get_settings.cache_clear()
    try:
        with pytest.raises(SearchError) as e:
            run(flight_service.search_flights({"origin": "A", "destination": "B"}, "t"))
        assert e.value.code == "PROVIDER_UNAVAILABLE"
        with pytest.raises(SearchError):
            run(train_service.search_trains({"origin": "A", "destination": "B"}, "t"))
        with pytest.raises(SearchError):
            run(hotel_service.search_hotels({"destination": "Goa"}, "t"))
        with pytest.raises(SearchError):
            run(cab_service.search_cabs({"pickup": "A", "drop": "B"}, "t"))
    finally:
        get_settings.cache_clear()


def _client():
    from app.main import app

    return TestClient(app, raise_server_exceptions=False)


def test_flight_status_validation():
    client = _client()
    r = client.post("/api/v1/search/flight-status", json={})
    assert r.status_code == 200
    assert r.json()["error"]["code"] == "INVALID_SEARCH"


def test_flight_status_not_supported_by_default():
    client = _client()
    r = client.post("/api/v1/search/flight-status", json={"number": "6E123"})
    assert r.status_code == 200
    assert r.json()["error"]["code"] == "PROVIDER_UNAVAILABLE"


def test_weather_validation():
    client = _client()
    r = client.get("/api/v1/geo/weather", params={"lat": 999, "lon": 77})
    assert r.status_code == 400


def test_providers_health_reflects_real_state(_env, monkeypatch):
    monkeypatch.setenv("HOTEL_PROVIDER", "overpass")
    get_settings.cache_clear()
    try:
        client = _client()
        r = client.get("/api/v1/providers/health")
        assert r.status_code == 200
        states = {h["provider"]: h["state"] for h in r.json()["providers"]}
        assert states["hotels"] == "SUCCESS"
        assert "weather" in states
    finally:
        get_settings.cache_clear()
