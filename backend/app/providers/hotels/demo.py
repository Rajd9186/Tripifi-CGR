"""Demo hotel inventory. Deterministic per destination — never random."""

from app.schemas.schemas import HotelOffer


class DemoHotelProvider:
    name = "demo"

    async def search(self, destination: str, checkin: str | None = None, checkout: str | None = None) -> list[HotelOffer]:
        dest = (destination or "Gangtok").strip()
        key = "".join(c for c in dest.upper() if c.isalpha())[:3] or "GEN"
        return [
            HotelOffer(
                id=f"HTL-{key}-001", provider="demo", name=f"The Grand {dest}",
                destination=dest, location=f"MG Marg, {dest}", rating=4.7,
                room_type="Deluxe Room", amenities=["WiFi", "Breakfast", "Heater", "Mountain view"],
                breakfast=True, cancellation="Free cancellation",
                price_per_night=6800, total_price=20400, is_demo=True,
            ),
            HotelOffer(
                id=f"HTL-{key}-002", provider="demo", name=f"{dest} Retreat",
                destination=dest, location=f"Near Mall Road, {dest}", rating=4.3,
                room_type="Premium Room", amenities=["WiFi", "Breakfast", "Parking"],
                breakfast=True, cancellation="Free cancellation",
                price_per_night=4200, total_price=12600, is_demo=True,
            ),
        ]
