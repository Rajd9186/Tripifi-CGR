"""Itinerary agent: logical day ordering. Validation happens downstream."""

DAY_TEMPLATES = {
    1: "Arrival + local orientation",
    -1: "Leisure + departure",
}


async def build_itinerary(destination: str, days: int, activities: list[dict]) -> list[dict]:
    plan: list[dict] = []
    acts = list(activities)
    for day in range(1, days + 1):
        if day == 1:
            title = f"Arrive in {destination} — local orientation"
        elif day == days:
            title = "Leisure morning + departure"
        else:
            act = acts.pop(0) if acts else None
            title = act["title"] if act else f"Explore {destination}"
        plan.append({"day": day, "title": title})
    # Leftover activities append to middle days in order.
    return plan
