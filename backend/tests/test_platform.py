import asyncio

from app.providers.demo import DemoAIProvider, DemoFlightProvider, DemoPaymentProvider
from app.services.pricing import calculate_snapshot


def test_pricing_snapshot_math():
    snap = calculate_snapshot(flights=14800, hotels=18500, cabs=9200, activities=3400, food=2500, travellers=2)
    assert snap.subtotal == 14800 + 18500 + 9200 + 3400 + 2500
    assert snap.taxes == round(snap.subtotal * 0.05)
    assert snap.total == snap.subtotal + snap.taxes
    assert snap.per_traveller * 2 >= snap.total


def test_pricing_never_negative():
    snap = calculate_snapshot(flights=100, discounts=100000, travellers=1)
    assert snap.total == 0


def test_demo_flight_offers_are_demo_marked():
    offers = asyncio.run(DemoFlightProvider().search("CCU", "DEL", "2026-12-12", 2))
    assert len(offers) == 3
    assert all(o.is_demo for o in offers)
    assert all(o.currency == "INR" for o in offers)


def test_demo_payment_is_simulated():
    created = asyncio.run(DemoPaymentProvider().create_payment(47250, "INR", "key-1"))
    assert created["is_demo"] is True
    assert created["status"] == "PENDING"


def test_ai_actions_are_allowlisted():
    from app.routers.ai import ALLOWED_ACTION_TYPES

    result = asyncio.run(DemoAIProvider().chat("Plan Sikkim", None))
    for action in result["actions"]:
        assert action["type"] in ALLOWED_ACTION_TYPES
    assert result["is_demo"] is True
