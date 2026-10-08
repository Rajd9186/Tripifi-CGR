"""Tripifi AI gateway. Orchestrates context → intent → workflow → tools →
validation → response, emitting SSE progress events.

Facts (intent, prices, itinerary) are deterministic. The LLM narrates prose
only and can never change trip state except through validated tools.
"""

import time
import uuid
from typing import Any, AsyncIterator

from app.ai.memory import conversation as conversation_memory
from app.ai.memory import trip as trip_memory
from app.ai.prompts.system import PROMPT_VERSION, SYSTEM_PROMPT
from app.ai.providers import get_ai_provider
from app.ai.providers.base import AIProvider, AIProviderError
from app.ai.schemas.actions import UIAction
from app.ai.schemas.intent import IntentType
from app.ai.schemas.responses import AIResponse
from app.ai.workflows.trip_planning import get_trip_graph
from app.core.config import get_settings

SAFE_PROGRESS = {
    "Understanding your trip",
    "Searching stays",
    "Building itinerary",
    "Checking budget",
    "Finding suitable options",
}


def _request_id() -> str:
    return f"req_{uuid.uuid4().hex[:12]}"


class TripifiAIGateway:
    def __init__(self, provider: AIProvider | None = None):
        self.provider = provider or get_ai_provider()

    async def _narrate(self, prompt: str, fallback: str) -> str:
        """LLM prose layer. Any failure returns the deterministic fallback."""
        try:
            result = await self.provider.chat(
                [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": prompt},
                ],
                max_tokens=300,
            )
            text = result.get("content", "").strip()
            return text if text else fallback
        except AIProviderError:
            return fallback

    async def chat(
        self,
        message: str,
        conversation_id: str = "default",
        incoming_trip: dict | None = None,
        on_event: Any = None,
    ) -> AIResponse:
        request_id = _request_id()
        started = time.monotonic()

        async def emit(event: str, data: dict | None = None):
            if on_event:
                await on_event(event, data or {})

        await emit("AI_STARTED", {"request_id": request_id})
        conversation_memory.append_message(conversation_id, "USER", message)
        await emit("CONTEXT_LOADED", {"request_id": request_id})

        graph = get_trip_graph()
        try:
            final: dict = {}
            async for chunk in graph.astream(
                {
                    "message": message,
                    "conversation_id": conversation_id,
                    "request_id": request_id,
                    "incoming_trip": incoming_trip or {},
                    "events": [],
                }
            ):
                for _node, values in chunk.items():
                    final.update(values or {})
                    for event in (values or {}).get("events", []) if isinstance(values, dict) else []:
                        await emit(event, {"request_id": request_id})
        except Exception as e:
            await emit("AI_ERROR", {"request_id": request_id, "error": "workflow_failed"})
            conversation_memory.append_message(
                conversation_id, "ASSISTANT",
                "Tripifi AI is temporarily unavailable. Please try again in a moment.",
            )
            raise RuntimeError(f"workflow_failed: {e}") from e

        intent = final.get("intent")
        intent_name = intent.intent.value if intent else IntentType.GENERAL_TRAVEL_QUESTION.value
        await emit("INTENT_DETECTED", {"request_id": request_id, "intent": intent_name})

        deterministic_message: str = final.get("response", "")
        narration = await self._narrate(
            f"Rephrase concisely for a traveller (2-4 sentences, no new facts, no prices, no availability claims): {deterministic_message}",
            deterministic_message,
        )
        await emit("AI_MESSAGE", {"request_id": request_id})

        actions = [UIAction(**a) if isinstance(a, dict) else a for a in final.get("actions", [])]
        response = AIResponse(
            message=narration,
            intent=intent_name,
            actions=actions,
            cards=final.get("cards", []),
            trip_update=final.get("trip_state"),
            sources=["tripifi-demo-data"],
            requires_confirmation=any(a.requires_confirmation for a in actions),
            is_demo=True,
            request_id=request_id,
            prompt_version=PROMPT_VERSION,
        )
        conversation_memory.append_message(
            conversation_id, "ASSISTANT", narration,
            {"intent": intent_name, "trip_id": (final.get("trip_state") or {}).get("trip_id")},
        )
        latency_ms = int((time.monotonic() - started) * 1000)
        await emit("AI_COMPLETED", {"request_id": request_id, "latency_ms": latency_ms})
        # Structured logging without secrets or personal data.
        print(f"[ai] request_id={request_id} intent={intent_name} latency_ms={latency_ms} "
              f"provider={self.provider.name} actions={len(actions)}")
        return response

    async def stream_chat(
        self, message: str, conversation_id: str = "default", incoming_trip: dict | None = None
    ) -> AsyncIterator[dict]:
        """SSE event stream: progress events, then the full structured result."""
        queue: list[dict] = []

        async def collect(event: str, data: dict):
            queue.append({"event": event, "data": data})

        try:
            response = await self.chat(message, conversation_id, incoming_trip, on_event=collect)
        except RuntimeError:
            yield {"event": "AI_ERROR", "data": {"message": "Tripifi AI is temporarily unavailable. Please try again in a moment."}}
            return
        for item in queue:
            yield item
        yield {"event": "AI_RESULT", "data": response.model_dump()}
