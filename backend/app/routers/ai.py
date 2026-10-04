"""Tripifi AI service boundary. Structured output; never invents bookings or live availability."""

from fastapi import APIRouter

from app.providers.demo import DemoAIProvider
from app.schemas.schemas import AIChatIn, AIChatOut

router = APIRouter(prefix="/ai", tags=["ai"])

ALLOWED_ACTION_TYPES = {
    "ADD_DESTINATION",
    "ADD_HOTEL",
    "ADD_FLIGHT",
    "ADD_CAB",
    "ADD_ACTIVITY",
    "CHANGE_DATE",
    "CHANGE_BUDGET",
    "REMOVE_ITEM",
    "OPTIMIZE_TRIP",
}


@router.post("/chat", response_model=AIChatOut)
async def chat(body: AIChatIn):
    result = await DemoAIProvider().chat(body.message, {"trip_id": body.trip_id})
    actions = [a for a in result.get("actions", []) if a.get("type") in ALLOWED_ACTION_TYPES]
    return AIChatOut(message=result["message"], trip_plan=result.get("trip_plan"), actions=actions, is_demo=True)


@router.post("/plan-trip", response_model=AIChatOut)
async def plan_trip(body: dict):
    brief = {
        "destination": body.get("destination", "Sikkim"),
        "duration": body.get("duration", 6),
        "travellers": body.get("travellers", 2),
    }
    result = await DemoAIProvider().plan_trip(brief)
    actions = [a for a in result.get("actions", []) if a.get("type") in ALLOWED_ACTION_TYPES]
    return AIChatOut(message=result["message"], trip_plan=result.get("trip_plan"), actions=actions, is_demo=True)


@router.post("/optimize-trip", response_model=AIChatOut)
async def optimize_trip(body: dict):
    return AIChatOut(
        message="Demo optimization: consider a comfortable hotel tier and a private SUV for mountain roads. No live prices were changed.",
        trip_plan=None,
        actions=[],
        is_demo=True,
    )
