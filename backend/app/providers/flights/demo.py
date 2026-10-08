"""Demo flight schedules. Deterministic per route — never random per request."""

from app.schemas.schemas import FlightOffer


class DemoFlightProvider:
    name = "demo"

    async def search(self, origin: str, destination: str, date: str | None, travellers: int = 2) -> list[FlightOffer]:
        o, d = (origin or "CCU").upper(), (destination or "DEL").upper()
        return [
            FlightOffer(
                id=f"FL-{o}-{d}-001", provider="demo", airline="IndiGo",
                flight_number="6E-2043", origin=o, destination=d,
                departure="06:30", arrival="08:55", duration_minutes=145,
                stops=0, baggage_kg=15, fare=7850, refundable=True, seat_available=True, is_demo=True,
            ),
            FlightOffer(
                id=f"FL-{o}-{d}-002", provider="demo", airline="Air India",
                flight_number="AI-401", origin=o, destination=d,
                departure="09:15", arrival="11:40", duration_minutes=145,
                stops=0, baggage_kg=25, fare=8490, refundable=True, seat_available=True, is_demo=True,
            ),
            FlightOffer(
                id=f"FL-{o}-{d}-003", provider="demo", airline="SpiceJet",
                flight_number="SG-8181", origin=o, destination=d,
                departure="18:45", arrival="21:10", duration_minutes=145,
                stops=0, baggage_kg=15, fare=6990, refundable=False, seat_available=True, is_demo=True,
            ),
        ]

    async def get_details(self, offer_id: str) -> FlightOffer | None:
        results = await self.search("CCU", "DEL", None)
        return next((f for f in results if f.id == offer_id), None)
