"""Phase 8: provider contracts, search validation, filters/sorts, failure modes, cache."""

import pytest

from app.providers import registry
from app.services.search import (
    activity_service,
    cab_service,
    destination_service,
    flight_service,
    hotel_service,
    train_service,
)
from app.services.search.base import SearchError
from app.services.search.recommendation_service import recommend


def test_registry_defaults_to_demo():
    # Phase 4 live-first defaults: hotels try Overpass listings, routing OSRM,
    # weather Open-Meteo; flights/trains stay demo by design.
    assert registry.get_flight_provider().name == "demo"
    assert registry.get_train_provider().name == "demo"
    assert registry.get_hotel_provider().name == "overpass"
    assert [p.name for p in registry.get_provider_chain("hotel")] == ["overpass", "demo"]
    assert registry.get_cab_provider().name == "demo"
    assert registry.get_activity_provider().name == "demo"
    assert registry.get_routing_provider().name == "osrm"
    assert [p.name for p in registry.get_provider_chain("routing")] == ["osrm", "estimate"]
    assert registry.get_weather_provider().name == "open_meteo"
    assert registry.get_package_provider().name == "demo"


def test_envelope_mode_follows_serving_provider():
    from app.services import capability

    # Config-first view: overpass chain reports DISCOVERY.
    assert capability.service_mode("hotel")["mode"] == "DISCOVERY"
    # Served-by view: demo fallback reports ASSISTED (never fake DISCOVERY).
    assert capability.service_mode("hotel", first_override="demo")["mode"] == "ASSISTED"
    assert capability.service_mode("hotel", first_override="overpass")["mode"] == "DISCOVERY"


def test_registry_rejects_unknown_provider(monkeypatch):
    monkeypatch.setenv("FLIGHT_PROVIDER", "bogus")
    # lru_cache on settings: bypass by constructing directly is complex;
    # instead assert the selector raises for unknown names.
    with pytest.raises(ValueError):
        registry._select("bogus", lambda: None, "flight")


def test_provider_health_shape():
    health = registry.get_provider_health()
    names = {h["provider"] for h in health}
    assert {"flights", "trains", "hotels", "cabs", "routing"} <= names
    for h in health:
        assert h["state"] in ("DEMO", "UNAVAILABLE", "ERROR", "SUCCESS", "NOT_CONFIGURED")
        assert "bookable" in h


def _run(coro):
    import asyncio

    return asyncio.run(coro)


def test_flight_search_valid():
    payload = _run(flight_service.search_flights(
        {"origin": "CCU", "destination": "DEL", "departure_date": "2099-11-10", "travellers": 2}, "t1"))
    assert payload["success"] is True
    assert len(payload["data"]["results"]) == 3
    assert payload["data"]["provider"] == {"name": "demo", "status": "DEMO"}
    ids = [r["id"] for r in payload["data"]["results"]]
    assert ids == ["FL-CCU-DEL-001", "FL-CCU-DEL-002", "FL-CCU-DEL-003"]
    assert all(r["status"] == "DEMO" for r in payload["data"]["results"])


def test_flight_search_validation():
    with pytest.raises(SearchError) as e:
        _run(flight_service.search_flights({"origin": "CCU", "destination": "CCU"}, "t"))
    assert e.value.code == "INVALID_SEARCH"
    with pytest.raises(SearchError):
        _run(flight_service.search_flights({"origin": "", "destination": "DEL"}, "t"))


def test_flight_filters_and_sort():
    cheapest = _run(flight_service.search_flights(
        {"origin": "CCU", "destination": "DEL"}, "t", {"non_stop": True}, "cheapest"))
    fares = [r["fare"] for r in cheapest["data"]["results"]]
    assert fares == sorted(fares)
    refundable = _run(flight_service.search_flights(
        {"origin": "CCU", "destination": "DEL"}, "t", {"refundable": True}, "recommended"))
    assert all(r["refundable"] for r in refundable["data"]["results"])


def test_train_search_and_class_filter():
    payload = _run(train_service.search_trains({"origin": "HWH", "destination": "NDLS"}, "t"))
    assert payload["success"] is True
    assert len(payload["data"]["results"]) == 2
    filtered = _run(train_service.search_trains(
        {"origin": "HWH", "destination": "NDLS"}, "t", {"travel_class": "2A"}, "recommended"))
    assert len(filtered["data"]["results"]) == 1
    assert filtered["data"]["results"][0]["travel_class"] == "2A"


def test_hotel_search_validation_and_sort():
    with pytest.raises(SearchError) as e:
        _run(hotel_service.search_hotels({"destination": "Goa", "checkin": "2099-05-10", "checkout": "2099-05-10"}, "t"))
    assert e.value.code == "INVALID_SEARCH"
    payload = _run(hotel_service.search_hotels({"destination": "Goa"}, "t", {}, "rating"))
    ratings = [r["rating"] for r in payload["data"]["results"]]
    assert ratings == sorted(ratings, reverse=True)


def test_cab_search_uses_pricing_engine():
    payload = _run(cab_service.search_cabs({"pickup": "Bagdogra", "drop": "Gangtok", "trip_type": "one_way"}, "t"))
    assert payload["success"] is True
    for r in payload["data"]["results"]:
        assert r["total_price"] == r["price"] > 0
        assert r["base_fare"] > 0
    with pytest.raises(SearchError):
        _run(cab_service.search_cabs({"pickup": "", "drop": "Gangtok"}, "t"))


def test_activity_search_deterministic_ids():
    a = _run(activity_service.search_activities({"destination": "Sikkim"}, "t"))
    b = _run(activity_service.search_activities({"destination": "Sikkim"}, "t"))
    assert [x["id"] for x in a["data"]["results"]] == [x["id"] for x in b["data"]["results"]]
    assert a["data"]["results"][0]["id"] == "ACT-SKG-001"


def test_destination_search_and_scoring():
    mountains = destination_service.search_destinations({"query": "mountains", "limit": 6})
    assert len(mountains) >= 4
    assert all("score" in d for d in mountains)
    romantic = destination_service.search_destinations({"styles": ["romantic"], "budget": 45000, "days": 4, "limit": 6})
    slugs = [d["slug"] for d in romantic]
    assert "goa" in slugs or "kerala" in slugs
    weekend = destination_service.search_destinations({"query": "weekend from kolkata"})
    assert isinstance(weekend, list)


def test_recommendation_is_deterministic():
    offers = [
        {"total_price": 5000, "rating": 4.8, "refundable": True, "duration_minutes": 120},
        {"total_price": 9000, "rating": 4.2, "refundable": False, "duration_minutes": 300},
    ]
    first = recommend(offers, {"budget": 6000})
    second = recommend(offers, {"budget": 6000})
    assert first == second
    assert first[0]["total_price"] == 5000


def test_disabled_provider_returns_unavailable():
    import app.providers.registry as reg

    class Disabled:
        name = "disabled"

    orig = reg.get_provider_chain
    reg.get_provider_chain = lambda service: [Disabled()]
    try:
        with pytest.raises(SearchError) as e:
            _run(hotel_service.search_hotels({"destination": "Goa"}, "t"))
        assert e.value.code == "PROVIDER_UNAVAILABLE"
    finally:
        reg.get_provider_chain = orig


def test_cache_dedupes_provider_calls():
    calls = {"n": 0}

    async def counting_search(*a, **k):
        calls["n"] += 1
        from app.schemas.schemas import ActivityOffer

        return [ActivityOffer(id="ACT-X-1", title="T", destination="Sikkim", price=0)]

    import app.providers.activities.demo as demo_mod

    orig = demo_mod.DemoActivityProvider.search
    demo_mod.DemoActivityProvider.search = counting_search
    try:
        # Unique destination so earlier tests' cache entries can't interfere.
        _run(activity_service.search_activities({"destination": "Zanskar"}, "t"))
        _run(activity_service.search_activities({"destination": "Zanskar"}, "t"))
        assert calls["n"] == 1
    finally:
        demo_mod.DemoActivityProvider.search = orig
