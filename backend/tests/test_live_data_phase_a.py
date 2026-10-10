"""Phase (a): envelope, registry chains, config. No network."""

import pytest

from app.providers import registry
from app.services import envelope as env


def test_envelope_requires_known_state_and_mode():
    good = env.result_envelope(
        state="SUCCESS", data={"a": 1}, source="osrm",
        is_live=True, attribution="x", cache_ttl=60, mode="LIVE",
    )
    assert good["fetched_at"] and good["cache_ttl"] == 60
    with pytest.raises(ValueError):
        env.result_envelope(state="BOGUS", data=None, source="x")
    with pytest.raises(ValueError):
        env.result_envelope(state="SUCCESS", data=None, source="x", mode="BOGUS")


def test_envelope_failure_mapping():
    from app.providers.free import ProviderError

    assert env.error_to_state(ProviderError("TIMEOUT")) == "TIMEOUT"
    assert env.error_to_state(TimeoutError()) == "TIMEOUT"
    assert env.error_to_state(RuntimeError("x")) == "UNAVAILABLE"
    failed = env.failure_envelope(ProviderError("RATE_LIMITED"), source="osrm")
    assert failed["state"] == "RATE_LIMITED"
    assert failed["is_live"] is False


def test_parse_chain():
    assert registry.parse_chain("osrm,estimate") == ["osrm", "estimate"]
    assert registry.parse_chain("  demo  ") == ["demo"]
    assert registry.parse_chain("") == []
    assert registry.parse_chain(None) == []


def test_cab_aliases():
    assert "tripifi" in registry.ADAPTERS["cab"]
    assert "estimate" in registry.ADAPTERS["cab"]


def test_registry_rejects_unknown_at_selection():
    with pytest.raises(ValueError):
        registry._select("bogus", lambda: None, "flight")


def test_validate_registry_accepts_defaults():
    resolved = registry.validate_registry()
    # Live-only defaults: no demo fallbacks for inventory.
    assert resolved["flight"] == ["serpapi", "aviationstack"]
    assert resolved["train"] == ["disabled"]
    assert resolved["hotel"] == ["overpass"]
    assert resolved["routing"] == ["osrm", "estimate"]
    assert resolved["weather"] == ["open_meteo"]
    assert resolved["geocoding"] == ["nominatim"]


def test_validate_registry_rejects_unknown(monkeypatch):
    monkeypatch.setenv("ROUTING_PROVIDER", "osrm,bogus")
    from app.core.config import get_settings

    get_settings.cache_clear()
    try:
        with pytest.raises(ValueError) as e:
            registry.validate_registry()
        assert "bogus" in str(e.value)
        assert "osrm" in str(e.value) or "estimate" in str(e.value)
    finally:
        get_settings.cache_clear()


def test_chain_first_is_backward_compatible():
    assert registry.get_flight_provider().name == "serpapi"
    assert registry.get_train_provider().name == "disabled"
    assert registry.get_hotel_provider().name == "overpass"
    assert registry.get_cab_provider().name == "demo"
    assert registry.get_geocoding_provider().name == "nominatim"


def test_provider_status_states():
    assert registry.provider_status("flights", "demo")["state"] == "DEMO"
    assert registry.provider_status("flights", "disabled")["state"] == "UNAVAILABLE"
    assert registry.provider_status("flights", "osrm")["state"] == "SUCCESS"
    assert registry.provider_status("flights", "aviationstack")["state"] == "NOT_CONFIGURED"


def test_config_has_live_data_fields():
    from app.core.config import get_settings

    s = get_settings()
    for field in [
        "weather_provider", "open_meteo_api_key", "open_meteo_base_url",
        "overpass_base_url", "aviationstack_base_url", "aviationstack_paid_key",
        "aviationstack_monthly_quota", "external_timeout_seconds",
        "circuit_failure_threshold", "circuit_open_seconds", "quota_stop_pct",
    ]:
        assert hasattr(s, field), field
