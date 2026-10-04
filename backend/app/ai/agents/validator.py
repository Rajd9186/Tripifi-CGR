"""Validator agent: deterministic checks before anything reaches the user."""

from app.ai.schemas.intent import TravelIntent


def validate_plan(intent: TravelIntent, trip_state: dict, budget: dict, itinerary: list[dict]) -> list[str]:
    issues: list[str] = []
    days = intent.duration_days or trip_state.get("duration_days") or 0
    if days and len(itinerary) != days:
        issues.append(f"Itinerary has {len(itinerary)} days but the trip is {days} days.")
    day_numbers = sorted(e.get("day", 0) for e in itinerary)
    if day_numbers != list(range(1, len(itinerary) + 1)):
        issues.append("Itinerary days are not sequential.")
    if budget.get("total", 0) < 0:
        issues.append("Budget total is negative.")
    if intent.budget and budget.get("total", 0) > intent.budget * 3:
        issues.append("Estimate far exceeds the stated budget — recheck selections.")
    return issues


def validate_actions(actions: list[dict]) -> list[str]:
    from app.ai.schemas.actions import SAFETY

    issues: list[str] = []
    for action in actions:
        action_type = action.get("type", "")
        if action_type not in SAFETY:
            issues.append(f"Unknown action type: {action_type}")
    return issues
