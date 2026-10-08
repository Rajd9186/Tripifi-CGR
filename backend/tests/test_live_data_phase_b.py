"""Phase (b): reliability primitives, honesty schemas, new providers. Mocks only."""

import asyncio

import pytest

from app.providers.free import ProviderError
from app.schemas import schemas as S
from app.services import reliability as rel


@pytest.fixture(autouse=True)
def _clean():
    import os

    rel.reset_reliability_state()
    try:
        os.remove(rel._QUOTA_FILE)
    except OSError:
        pass
    yield
    rel.reset_reliability_state()
    try:
        os.remove(rel._QUOTA_FILE)
    except OSError:
        pass


def run(coro):
    return asyncio.run(coro)


# -- reliability primitives -------------------------------------------------


def test_retry_only_retries_transport_errors():
    import httpx

    calls = {"n": 0}

    async def flaky():
        calls["n"] += 1
        if calls["n"] < 3:
            raise httpx.ConnectError("down")
        return "ok"

    assert run(rel.retry_get(flaky, attempts=3, base_delay=0.001)) == "ok"
    assert calls["n"] == 3

    async def app_error():
        raise ProviderError("AUTH_ERROR", "bad key")

    with pytest.raises(ProviderError):
        run(rel.retry_get(app_error, attempts=3, base_delay=0.001))


def test_circuit_opens_after_threshold(monkeypatch):
    monkeypatch.setenv("CIRCUIT_FAILURE_THRESHOLD", "3")
    monkeypatch.setenv("CIRCUIT_OPEN_SECONDS", "60")
    from app.core.config import get_settings

    get_settings.cache_clear()
    try:
        async def fail():
            raise ProviderError("UNAVAILABLE", "down")

        for _ in range(3):
            with pytest.raises(ProviderError):
                run(rel.guarded("prov-x", fail))
        # Breaker now open: immediate UNAVAILABLE without calling fetch.
        async def never():
            raise AssertionError("must not be called")

        with pytest.raises(ProviderError) as e:
            run(rel.guarded("prov-x", never))
        assert e.value.state == "UNAVAILABLE"
        assert "circuit open" in str(e.value)
    finally:
        get_settings.cache_clear()


def test_single_flight_dedupes():
    calls = {"n": 0}

    async def slow():
        calls["n"] += 1
        await asyncio.sleep(0.02)
        return "v"

    async def main():
        return await asyncio.gather(*[rel.single_flight("k", slow) for _ in range(5)])

    assert run(main()) == ["v"] * 5
    assert calls["n"] == 1


def test_swr_cache_hit_and_stale():
    from app.services.cache import MemoryCache

    cache = MemoryCache()
    calls = {"n": 0}

    async def fetch():
        calls["n"] += 1
        return {"v": calls["n"]}

    v, cached = run(rel.swr_get(cache, "k", 60, 60, fetch))
    assert (v, cached) == ({"v": 1}, False)
    v, cached = run(rel.swr_get(cache, "k", 60, 60, fetch))
    assert (v, cached) == ({"v": 1}, True)
    assert calls["n"] == 1


def test_quota_guard_stops_at_threshold(monkeypatch, tmp_path):
    monkeypatch.setenv("QUOTA_STOP_PCT", "90")
    from app.core.config import get_settings

    get_settings.cache_clear()
    try:
        rel._monthly_use["av"] = {rel._month_key(): 9}
        with pytest.raises(ProviderError) as e:
            rel.quota_check("av", 10)
        assert e.value.state == "RATE_LIMITED"
        assert rel.quota_remaining("av", 10) == 0
        rel._monthly_use.clear()
        rel._quota_loaded = True
        assert rel.quota_remaining("av", 10) == 1
    finally:
        get_settings.cache_clear()


def test_https_only_rejects_plaintext():
    with pytest.raises(ProviderError) as e:
        rel.https_only("http://example.com/x", "Test")
    assert e.value.state == "NOT_SUPPORTED"
    assert rel.https_only("https://example.com/x", "Test").startswith("https://")


# -- honesty schemas ----------------------------------------------------------


def test_missing_price_is_null_never_zero():
    f = S.FlightOffer(
        id="x", provider="aviationstack", status="LIVE", airline="A", flight_number="1",
        origin="DEL", destination="BOM", departure="10:00", arrival="12:00",
        duration_minutes=120, stops=0, is_demo=False,
    )
    assert f.fare is None and f.price is None
    t = S.TrainOffer(
        id="x", provider="demo", train_number="1", train_name="T", origin="A",
        destination="B", departure="1", arrival="2", duration_minutes=1,
        travel_class="3A", is_demo=True,
    )
    assert t.fare is None
    h = S.HotelOffer(
        id="x", provider="overpass", status="LIVE", name="N", destination="D",
        location="L", is_demo=False,
    )
    assert h.rating is None and h.nightly_price is None and h.total_price is None
    assert h.breakfast is None and h.room_type is None
    a = S.ActivityOffer(id="x", title="T", destination="D", is_demo=False)
    assert a.price is None


def test_demo_explicit_values_preserved():
    f = S.FlightOffer(
        id="x", provider="demo", airline="A", flight_number="1", origin="A",
        destination="B", departure="1", arrival="2", duration_minutes=1,
        stops=0, fare=100, refundable=True, seat_available=True, is_demo=True,
    )
    assert f.price == 100
    assert f.seat_available is True


# -- new providers (mocked transport) ------------------------------------------


class _FakeResp:
    def __init__(self, status, payload=None):
        self.status_code = status
        self._payload = payload or {}

    def json(self):
        if isinstance(self._payload, Exception):
            raise self._payload
        return self._payload


class _FakeStreamResp(_FakeResp):
    def __init__(self, status, lines):
        super().__init__(status, {})
        self._lines = lines

    async def __aenter__(self):
        return self

    async def __aexit__(self, *a):
        return False

    async def aiter_lines(self):
        for line in self._lines:
            yield line


class _FakeClient:
    response = None
    seen = {}

    def __init__(self, *a, **k):
        pass

    async def __aenter__(self):
        return self

    async def __aexit__(self, *a):
        return False

    async def post(self, url, headers=None, **kwargs):
        _FakeClient.seen = {"url": url, "json": kwargs.get("json"), "data": kwargs.get("data")}
        return _FakeClient.response

    async def get(self, url, headers=None, **kwargs):
        _FakeClient.seen = {"url": url, "params": kwargs.get("params")}
        return _FakeClient.response

    def stream(self, method, url, headers=None, **kwargs):
        _FakeClient.seen = {"url": url, "json": kwargs.get("json")}
        return _FakeClient.response


@pytest.fixture()
def fake_http(monkeypatch):
    import httpx

    monkeypatch.setattr(httpx, "AsyncClient", _FakeClient)
    return _FakeClient


def _env(monkeypatch, **pairs):
    for k, v in pairs.items():
        monkeypatch.setenv(k, v)
    from app.core.config import get_settings

    get_settings.cache_clear()
    return get_settings


def test_open_meteo_success_and_attribution(fake_http, monkeypatch):
    _env(monkeypatch)
    from app.providers.weather.open_meteo import OpenMeteoWeatherProvider

    body = {
        "current": {"temperature_2m": 21.5, "weather_code": 2},
        "daily": {
            "time": ["2026-10-09", "2026-10-10"],
            "temperature_2m_max": [24.0, 25.0],
            "temperature_2m_min": [16.0, 17.0],
            "precipitation_probability_max": [10, 60],
            "weather_code": [2, 63],
        },
    }
    _FakeClient.response = _FakeResp(200, body)
    out = run(OpenMeteoWeatherProvider().forecast(27.5, 88.5, days=2))
    assert out["state"] == "SUCCESS"
    assert out["mode"] == "LIVE" and out["is_live"] is True
    assert "Open-Meteo" in out["attribution"] and "CC BY" in out["attribution"]
    assert out["data"]["current_temp_c"] == 21.5
    assert out["data"]["daily"][1]["condition"] == "Rain"
    assert out["cache_ttl"] == 1800


def test_open_meteo_states(fake_http, monkeypatch):
    _env(monkeypatch)
    from app.providers.weather.open_meteo import OpenMeteoWeatherProvider

    p = OpenMeteoWeatherProvider()
    _FakeClient.response = _FakeResp(401, {})
    with pytest.raises(ProviderError) as e:
        run(p.forecast(27.5, 88.5))
    assert e.value.state == "AUTH_ERROR"
    _FakeClient.response = _FakeResp(429, {})
    with pytest.raises(ProviderError) as e:
        run(p.forecast(27.5, 88.5))
    assert e.value.state == "RATE_LIMITED"

    import httpx

    _FakeClient.response = httpx.ConnectError("down")

    async def boom_get(url, headers=None, **kwargs):
        raise httpx.ConnectError("down")

    orig_get = _FakeClient.get
    _FakeClient.get = boom_get
    try:
        with pytest.raises(ProviderError) as e:
            run(p.forecast(27.5, 88.5))
        assert e.value.state == "UNAVAILABLE"
    finally:
        _FakeClient.get = orig_get


def test_overpass_hotels_discovery_no_prices(fake_http, monkeypatch):
    _env(monkeypatch)
    from app.providers.hotels.overpass import OverpassHotelProvider

    from app.providers import free as free_mod

    async def fake_geocode(self, query, limit=5):
        return [{"name": query, "lat": 27.3, "lon": 88.6, "attribution": "x"}]

    monkeypatch.setattr(free_mod.NominatimGeocodingProvider, "geocode", fake_geocode)
    _FakeClient.response = _FakeResp(200, {"elements": [
        {"type": "node", "lat": 27.3, "lon": 88.6,
         "tags": {"name": "Himalaya Lodge", "tourism": "guest_house", "internet_access": "yes"}},
        {"type": "node", "lat": 27.4, "lon": 88.7, "tags": {}},
    ]})
    offers = run(OverpassHotelProvider().search("Gangtok"))
    assert len(offers) == 2
    first = offers[0]
    assert first.provider == "overpass" and first.is_demo is False
    assert first.name == "Himalaya Lodge"
    assert "Guest House" in first.amenities and "WiFi" in first.amenities
    assert first.nightly_price is None and first.total_price is None and first.rating is None
    assert first.status == "LIVE"


def test_overpass_activities_with_wiki(fake_http, monkeypatch):
    _env(monkeypatch)
    from app.providers.activities import overpass as act_mod
    from app.providers import free as free_mod

    async def fake_geocode(self, query, limit=5):
        return [{"name": query, "lat": 27.3, "lon": 88.6, "attribution": "x"}]

    monkeypatch.setattr(free_mod.NominatimGeocodingProvider, "geocode", fake_geocode)

    calls = {"n": 0}

    async def fake_wiki(title, timeout):
        calls["n"] += 1
        return f"{title} is a famous place." if calls["n"] <= 3 else None

    monkeypatch.setattr(act_mod, "_wikipedia_extract", fake_wiki)
    _FakeClient.response = _FakeResp(200, {"elements": [
        {"type": "node", "tags": {"name": "Tsomgo Lake", "tourism": "attraction"}},
    ]})
    offers = run(act_mod.OverpassActivityProvider().search("Gangtok"))
    assert len(offers) == 1
    assert offers[0].price is None
    assert offers[0].description == "Tsomgo Lake is a famous place."
    assert offers[0].is_demo is False


def test_aviationstack_gated_and_quota(fake_http, monkeypatch):
    _env(monkeypatch, AVIATIONSTACK_PAID_KEY="false", AVIATION_API_KEY="k")
    from app.core.config import get_settings
    from app.providers.free import AviationstackFlightProvider

    get_settings.cache_clear()
    with pytest.raises(ProviderError) as e:
        run(AviationstackFlightProvider().search("DEL", "BOM", None))
    assert e.value.state == "NOT_SUPPORTED"


def test_aviationstack_https_and_null_fare(fake_http, monkeypatch):
    _env(monkeypatch, AVIATIONSTACK_PAID_KEY="true", AVIATION_API_KEY="k")
    from app.core.config import get_settings
    from app.providers.free import AviationstackFlightProvider

    get_settings.cache_clear()
    _FakeClient.response = _FakeResp(200, {"data": [{
        "airline": {"name": "IndiGo"}, "flight": {"iata": "6E123"},
        "departure": {"scheduled": "2026-11-01T10:00:00", "iata": "DEL"},
        "arrival": {"scheduled": "2026-11-01T12:00:00", "iata": "BOM"},
    }]})
    offers = run(AviationstackFlightProvider().search("DEL", "BOM", None))
    assert _FakeClient.seen["url"].startswith("https://")
    assert offers[0].fare is None and offers[0].price is None
    assert offers[0].seat_available is False and offers[0].is_demo is False


def test_flight_status_envelope(fake_http, monkeypatch):
    _env(monkeypatch, AVIATIONSTACK_PAID_KEY="true", AVIATION_API_KEY="k")
    from app.core.config import get_settings
    from app.providers.free import AviationstackFlightProvider

    get_settings.cache_clear()
    _FakeClient.response = _FakeResp(200, {"data": [{
        "airline": {"name": "IndiGo"},
        "departure": {"iata": "DEL", "scheduled": "2026-11-01T10:00:00"},
        "arrival": {"iata": "BOM", "scheduled": "2026-11-01T12:00:00"},
        "flight_status": "scheduled",
    }]})
    out = run(AviationstackFlightProvider().flight_status("6E123"))
    assert out["state"] == "SUCCESS" and out["mode"] == "LIVE"
    assert out["data"]["fare"] is None
    assert out["data"]["flight_number"] == "6E123"
