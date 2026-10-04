"""Demo train schedules. Deterministic — never random per request."""

from app.schemas.schemas import TrainOffer

DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]


class DemoTrainProvider:
    name = "demo"

    async def search(self, origin: str, destination: str, date: str | None) -> list[TrainOffer]:
        o, d = origin or "HWH", destination or "NDLS"
        return [
            TrainOffer(
                id="TR-HWH-NDLS-001", provider="demo", train_number="12301",
                train_name="Howrah Rajdhani", origin=o, destination=d,
                departure="16:50", arrival="10:55", duration_minutes=1075,
                travel_class="3A", fare=2485, availability="Available",
                running_days=DAYS, is_demo=True,
            ),
            TrainOffer(
                id="TR-HWH-NDLS-002", provider="demo", train_number="12301",
                train_name="Howrah Rajdhani", origin=o, destination=d,
                departure="16:50", arrival="10:55", duration_minutes=1075,
                travel_class="2A", fare=3545, availability="Available",
                running_days=DAYS, is_demo=True,
            ),
        ]
