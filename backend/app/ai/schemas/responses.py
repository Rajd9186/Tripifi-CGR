"""Response contract + workflow state. Frontend parses this, never prose."""

from typing import Any, Literal

from pydantic import BaseModel, Field

from app.ai.schemas.actions import UIAction
from app.ai.schemas.intent import TravelIntent


class ResponseCard(BaseModel):
    kind: Literal["destination", "hotel", "transport", "budget", "itinerary", "activity"]
    title: str
    subtitle: str | None = None
    details: dict[str, Any] = Field(default_factory=dict)
    actions: list[UIAction] = Field(default_factory=list)


class AIResponse(BaseModel):
    message: str
    intent: str
    actions: list[UIAction] = Field(default_factory=list)
    cards: list[ResponseCard] = Field(default_factory=list)
    trip_update: dict[str, Any] | None = None
    sources: list[str] = Field(default_factory=list)
    requires_confirmation: bool = False
    pending_action: UIAction | None = None
    is_demo: bool = False
    narrated_live: bool = False
    request_id: str = ""
    prompt_version: str = "tripifi-ai-v1"


class TripAIState(BaseModel):
    trip_id: str | None = None
    origin: str | None = None
    destinations: list[str] = Field(default_factory=list)
    dates: dict[str, str | None] = Field(default_factory=dict)
    duration_days: int | None = None
    travellers: int = 2
    traveller_type: str | None = None
    budget: int | None = None
    preferences: dict[str, Any] = Field(default_factory=dict)
    transport: list[dict[str, Any]] = Field(default_factory=list)
    hotels: list[dict[str, Any]] = Field(default_factory=list)
    activities: list[dict[str, Any]] = Field(default_factory=list)
    itinerary: list[dict[str, Any]] = Field(default_factory=list)
    selected_items: list[dict[str, Any]] = Field(default_factory=list)
    unresolved_questions: list[str] = Field(default_factory=list)


class WorkflowState(BaseModel):
    message: str = ""
    conversation_id: str = ""
    request_id: str = ""
    intent: TravelIntent | None = None
    trip_state: TripAIState = Field(default_factory=TripAIState)
    tool_results: dict[str, Any] = Field(default_factory=dict)
    actions: list[UIAction] = Field(default_factory=list)
    cards: list[ResponseCard] = Field(default_factory=list)
    errors: list[str] = Field(default_factory=list)
    pending_action: UIAction | None = None
    response: str = ""
    sources: list[str] = Field(default_factory=list)
