"""Server-side pricing. Frontend displays; never trusts client totals."""

from datetime import datetime, timezone

from app.schemas.schemas import PricingSnapshot

TAX_RATE = 0.05


def calculate_snapshot(
    flights: int = 0,
    hotels: int = 0,
    cabs: int = 0,
    activities: int = 0,
    food: int = 0,
    addons: int = 0,
    discounts: int = 0,
    travellers: int = 2,
) -> PricingSnapshot:
    subtotal = flights + hotels + cabs + activities + food
    taxes = int(round(subtotal * TAX_RATE))
    total = max(0, subtotal + taxes + addons - discounts)
    per_traveller = (total + travellers - 1) // travellers if travellers else total
    return PricingSnapshot(
        subtotal=subtotal,
        taxes=taxes,
        discounts=discounts,
        addons=addons,
        total=total,
        per_traveller=per_traveller,
        calculated_at=datetime.now(timezone.utc),
    )
