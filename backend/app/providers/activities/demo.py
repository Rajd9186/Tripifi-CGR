"""Demo activities per destination. Stable IDs, deterministic."""

from app.schemas.schemas import ActivityOffer

_CATALOG: dict[str, list[dict]] = {
    "sikkim": [
        {"id": "ACT-SKG-001", "title": "Tsomgo Lake excursion", "duration": "Full day", "price": 1800},
        {"id": "ACT-SKG-002", "title": "MG Marg evening walk", "duration": "2–3 hours", "price": 0},
        {"id": "ACT-SKG-003", "title": "Pelling Skywalk", "duration": "Half day", "price": 1200},
    ],
    "kashmir": [
        {"id": "ACT-KSH-001", "title": "Gulmarg Gondola", "duration": "4–5 hours", "price": 1800},
        {"id": "ACT-KSH-002", "title": "Dal Lake shikara ride", "duration": "2 hours", "price": 900},
    ],
    "kerala": [
        {"id": "ACT-KER-001", "title": "Alleppey houseboat day cruise", "duration": "Full day", "price": 8500},
        {"id": "ACT-KER-002", "title": "Kathakali performance", "duration": "2 hours", "price": 500},
    ],
    "goa": [
        {"id": "ACT-GOA-001", "title": "Sunset cruise on the Mandovi", "duration": "2 hours", "price": 1200},
        {"id": "ACT-GOA-002", "title": "North Goa beach hopping", "duration": "Full day", "price": 2500},
    ],
    "rajasthan": [
        {"id": "ACT-RAJ-001", "title": "Amber Fort guided tour", "duration": "Half day", "price": 1500},
        {"id": "ACT-RAJ-002", "title": "Lake Pichola sunset boat ride", "duration": "2 hours", "price": 1100},
    ],
    "ladakh": [
        {"id": "ACT-LDK-001", "title": "Pangong Tso day trip", "duration": "Full day", "price": 4500},
        {"id": "ACT-LDK-002", "title": "Thiksey Monastery visit", "duration": "Half day", "price": 800},
    ],
}


class DemoActivityProvider:
    name = "demo"

    async def search(self, destination: str) -> list[ActivityOffer]:
        key = (destination or "").strip().lower()
        rows = _CATALOG.get(key, _CATALOG["sikkim"])
        return [
            ActivityOffer(
                id=r["id"], provider="demo", title=r["title"],
                destination=destination or "Sikkim", duration=r["duration"],
                price=int(r["price"]), currency="INR", is_demo=True,
            )
            for r in rows
        ]
