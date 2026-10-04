"""Demo providers. Entire platform runs without external credentials.

Every offer is marked is_demo=True so the frontend can label
'Sample fare' / 'Demo availability' honestly.
"""

from app.schemas.schemas import CabOffer, FlightOffer, HotelOffer, TrainOffer


class DemoFlightProvider:
    name = "demo"

    async def search(self, origin: str, destination: str, date: str | None, travellers: int = 2) -> list[FlightOffer]:
        o, d = origin.upper() or "CCU", destination.upper() or "DEL"
        return [
            FlightOffer(
                id=f"demo-flight-{o}-{d}-1", provider="demo", airline="IndiGo",
                flight_number="6E-2043", origin=o, destination=d,
                departure="06:30", arrival="08:55", duration_minutes=145,
                stops=0, baggage_kg=15, fare=7850, refundable=True, is_demo=True,
            ),
            FlightOffer(
                id=f"demo-flight-{o}-{d}-2", provider="demo", airline="Air India",
                flight_number="AI-401", origin=o, destination=d,
                departure="09:15", arrival="11:40", duration_minutes=145,
                stops=0, baggage_kg=25, fare=8490, refundable=True, is_demo=True,
            ),
            FlightOffer(
                id=f"demo-flight-{o}-{d}-3", provider="demo", airline="SpiceJet",
                flight_number="SG-8181", origin=o, destination=d,
                departure="18:45", arrival="21:10", duration_minutes=145,
                stops=0, baggage_kg=15, fare=6990, refundable=False, is_demo=True,
            ),
        ]

    async def get_details(self, offer_id: str) -> FlightOffer | None:
        results = await self.search("CCU", "DEL", None)
        return next((f for f in results if f.id == offer_id), None)


class DemoTrainProvider:
    name = "demo"

    async def search(self, origin: str, destination: str, date: str | None) -> list[TrainOffer]:
        return [
            TrainOffer(
                id="demo-train-12301-3A", provider="demo", train_number="12301",
                train_name="Howrah Rajdhani", origin=origin or "HWH",
                destination=destination or "NDLS", departure="16:50",
                arrival="10:55", duration_minutes=1075, travel_class="3A",
                fare=2485, availability="Available",
                running_days=["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], is_demo=True,
            ),
            TrainOffer(
                id="demo-train-12301-2A", provider="demo", train_number="12301",
                train_name="Howrah Rajdhani", origin=origin or "HWH",
                destination=destination or "NDLS", departure="16:50",
                arrival="10:55", duration_minutes=1075, travel_class="2A",
                fare=3545, availability="Available",
                running_days=["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], is_demo=True,
            ),
        ]


class DemoHotelProvider:
    name = "demo"

    async def search(self, destination: str, checkin: str | None = None, checkout: str | None = None) -> list[HotelOffer]:
        dest = destination or "Gangtok"
        return [
            HotelOffer(
                id=f"demo-hotel-{dest}-1", provider="demo", name="The Grand Himalaya",
                destination=dest, location=f"MG Marg, {dest}", rating=4.7,
                room_type="Deluxe Room", amenities=["WiFi", "Breakfast", "Heater", "Mountain view"],
                price_per_night=6800, total_price=20400, is_demo=True,
            ),
            HotelOffer(
                id=f"demo-hotel-{dest}-2", provider="demo", name="Alpine Retreat",
                destination=dest, location=f"Near Mall Road, {dest}", rating=4.3,
                room_type="Premium Room", amenities=["WiFi", "Breakfast", "Parking"],
                price_per_night=4200, total_price=12600, is_demo=True,
            ),
        ]


class DemoCabProvider:
    name = "demo"

    async def search(self, pickup: str, drop: str) -> list[CabOffer]:
        return [
            CabOffer(
                id="demo-cab-sedan", provider="demo", vehicle_type="Sedan",
                vehicle_model="Swift Dzire", capacity=4, luggage=2,
                included_km=250, extra_km_price=12, driver_rating=4.8,
                price=3600, is_demo=True,
            ),
            CabOffer(
                id="demo-cab-suv", provider="demo", vehicle_type="Premium SUV",
                vehicle_model="Toyota Innova Crysta", capacity=6, luggage=4,
                included_km=250, extra_km_price=15, driver_rating=4.9,
                price=6800, is_demo=True,
            ),
        ]


class DemoPaymentProvider:
    """Simulated payments. NEVER reports real money movement."""

    name = "demo"

    async def create_payment(self, amount: int, currency: str = "INR", idempotency_key: str | None = None) -> dict:
        return {
            "payment_reference": f"demo-pay-{idempotency_key or 'noid'}",
            "amount": amount,
            "currency": currency,
            "status": "PENDING",
            "is_demo": True,
        }

    async def verify_payment(self, payment_reference: str) -> dict:
        return {"payment_reference": payment_reference, "status": "SUCCESS", "is_demo": True}

    async def refund_payment(self, payment_reference: str, amount: int | None = None) -> dict:
        return {"payment_reference": payment_reference, "status": "REFUNDED", "is_demo": True}


class DemoMapsProvider:
    name = "demo"

    async def route(self, origin: str, destination: str) -> dict:
        return {
            "origin": origin, "destination": destination,
            "distance_km": 672, "duration_minutes": 125,
            "polyline": "demo-polyline", "is_demo": True,
        }


class DemoAIProvider:
    """Deterministic demo planner. Never invents bookings or live availability."""

    name = "demo"

    async def chat(self, message: str, context: dict | None = None) -> dict:
        return {
            "message": (
                "I can build a structured Sikkim plan from your brief. "
                "This demo response is generated locally — connect an LLM provider for live planning."
            ),
            "trip_plan": {"destination": "Sikkim", "duration": 6, "estimated_budget": 47800},
            "actions": [{"type": "ADD_DESTINATION", "payload": {"destination_slug": "sikkim"}}],
            "is_demo": True,
        }

    async def plan_trip(self, brief: dict) -> dict:
        return {
            "message": f"Demo plan for {brief.get('destination', 'Sikkim')}.",
            "trip_plan": {
                "destination": brief.get("destination", "Sikkim"),
                "duration": brief.get("duration", 6),
                "travellers": brief.get("travellers", 2),
                "estimated_budget": 47800,
            },
            "actions": [{"type": "ADD_DESTINATION", "payload": {"destination_slug": "sikkim"}}],
            "is_demo": True,
        }
