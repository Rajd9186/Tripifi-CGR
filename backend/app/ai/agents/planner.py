"""Planner agent: intent + tool results → actionable travel plan skeleton."""

from app.ai.schemas.intent import TravelIntent


async def build_plan(intent: TravelIntent, research: dict, trip_state: dict) -> dict:
    days = intent.duration_days or trip_state.get("duration_days") or 5
    travellers = intent.travellers or trip_state.get("travellers") or 2
    destination = intent.destination or (trip_state.get("destinations") or [None])[0] or "Sikkim"
    return {
        "destination": destination,
        "destination_slug": intent.destination_slug,
        "duration_days": days,
        "travellers": travellers,
        "traveller_type": intent.traveller_type,
        "budget": intent.budget if intent.budget is not None else trip_state.get("budget"),
        "research": research,
    }
