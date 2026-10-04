"""Tripifi AI service boundary. Structured output; never invents bookings or live availability."""

import json
import uuid

from fastapi import APIRouter
from sse_starlette.sse import EventSourceResponse

from app.ai.gateway import TripifiAIGateway
from app.ai.schemas.actions import SAFETY, ActionSafety
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

_gateway: TripifiAIGateway | None = None


def get_gateway() -> TripifiAIGateway:
    global _gateway
    if _gateway is None:
        _gateway = TripifiAIGateway()
    return _gateway


@router.post("/chat", response_model=AIChatOut)
async def chat(body: AIChatIn):
    """Gateway-backed chat. Falls back to the demo planner if the model is down."""
    try:
        response = await get_gateway().chat(body.message, body.conversation_id or "default", body.trip_context)
        legacy_actions = [
            {"type": a.type, "payload": a.payload}
            for a in response.actions
            if a.type in ALLOWED_ACTION_TYPES
        ]
        return AIChatOut(
            message=response.message,
            trip_plan=(response.trip_update or {}) or None,
            actions=legacy_actions,
            is_demo=True,
        )
    except RuntimeError:
        result = await DemoAIProvider().chat(body.message, {"trip_id": body.trip_id})
        actions = [a for a in result.get("actions", []) if a.get("type") in ALLOWED_ACTION_TYPES]
        return AIChatOut(message=result["message"], trip_plan=result.get("trip_plan"), actions=actions, is_demo=True)


@router.post("/stream")
async def stream(body: AIChatIn):
    """SSE: progress events followed by one AI_RESULT with the structured result."""
    gateway = get_gateway()

    async def generator():
        async for item in gateway.stream_chat(
            body.message, body.conversation_id or "default", body.trip_context
        ):
            yield {"event": item["event"], "data": json.dumps(item["data"])}

    return EventSourceResponse(generator())


@router.post("/action/confirm")
async def confirm_action(body: dict):
    action_type = str(body.get("type", ""))
    safety = SAFETY.get(action_type)
    if safety is None:
        return {"ok": False, "error": "Unknown action type"}
    return {
        "ok": True,
        "action": {"type": action_type, "payload": body.get("payload", {})},
        "confirmation_id": f"confirm-{uuid.uuid4().hex[:10]}",
    }


@router.post("/action/reject")
async def reject_action(body: dict):
    return {"ok": True, "rejected": body.get("type")}


@router.get("/health")
async def ai_health():
    try:
        status = await TripifiAIGateway().provider.health()
    except Exception:
        status = {"provider": "ollama", "configured": False, "reachable": False}
    status.pop("api_key", None)
    return status


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
