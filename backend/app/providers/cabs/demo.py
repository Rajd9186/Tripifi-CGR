"""Demo cab inventory. Prices are estimates via CabPricingService, never hardcoded totals."""

from app.schemas.schemas import CabOffer
from app.services.cab_pricing import estimate_fare


class DemoCabProvider:
    name = "demo"

    async def search(self, pickup: str, drop: str) -> list[CabOffer]:
        sedan = estimate_fare(120.0, "sedan", "oneway")
        suv = estimate_fare(120.0, "suv", "oneway")
        return [
            CabOffer(
                id="CAB-SEDAN-001", provider="demo", vehicle_type="Sedan",
                vehicle_model="Swift Dzire", capacity=4, luggage=2,
                included_km=100, extra_km_price=12, driver_rating=4.8,
                price=sedan["total"], is_demo=True,
            ),
            CabOffer(
                id="CAB-SUV-001", provider="demo", vehicle_type="Premium SUV",
                vehicle_model="Toyota Innova Crysta", capacity=6, luggage=4,
                included_km=150, extra_km_price=15, driver_rating=4.9,
                price=suv["total"], is_demo=True,
            ),
        ]
