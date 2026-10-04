from app.routers import enquiries as enquiries_router
from app.services import cab_pricing, capability
from app.services.cab_pricing import estimate_fare


def test_cab_estimate_math():
    fare = estimate_fare(154.0, "sedan", "oneway", tolls=350)
    assert fare["distance_km"] == 154.0
    assert fare["included_km"] == 100
    assert fare["extra_km"] == 54.0
    assert fare["base_fare"] == 1800
    assert fare["extra_km_charge"] == round(54.0 * 12)
    assert fare["toll_estimate"] == 350
    assert fare["total"] == fare["base_fare"] + fare["extra_km_charge"] + fare["driver_allowance"] + fare["toll_estimate"] + fare["taxes"]
    assert fare["label"] == "Estimated fare"


def test_cab_roundtrip_doubles_distance():
    oneway = estimate_fare(100.0, "suv", "oneway")
    roundtrip = estimate_fare(100.0, "suv", "roundtrip")
    assert roundtrip["distance_km"] == 200.0
    assert roundtrip["total"] > oneway["total"]


def test_phone_normalization():
    assert enquiries_router.normalize_phone("9876543210") == "+919876543210"
    assert enquiries_router.normalize_phone("+919876543210") == "+919876543210"
    assert enquiries_router.normalize_phone("+91 98765 43210") == "+919876543210"


def test_phone_rejects_bad_numbers():
    import pytest

    for bad in ["123", "1234567890", "abcdefghij", "+1 555 123 4567"]:
        with pytest.raises(ValueError):
            enquiries_router.normalize_phone(bad)


def test_capability_live_only_when_supported():
    live = capability.booking_capability("package", provider_ok=True)
    assert live == {"mode": "LIVE_RESULTS", "bookable": True, "enquiry": False}
    for service in ["flight", "train", "hotel", "cab"]:
        fallback = capability.booking_capability(service, provider_ok=True)
        assert fallback["mode"] == "ASSISTED_BOOKING"
        assert fallback["bookable"] is False
        assert fallback["enquiry"] is True


def test_provider_health_never_leaks_secrets():
    import json

    health = capability.provider_health()
    blob = json.dumps(health).lower()
    assert "api_key" not in blob
    assert "secret" not in blob
    assert {p["provider"] for p in health} >= {"flight", "hotel", "cab", "routing", "geocoding"}


def test_cab_module_importable():
    assert callable(cab_pricing.estimate_fare)
