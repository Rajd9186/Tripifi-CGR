"""Tripifi AI gateway. Orchestrates context → intent → workflow → tools →
validation → response, emitting SSE progress events.

Two answer paths:
- Trip-building intents run the deterministic LangGraph workflow over tool
  data (facts fixed); the LLM narrates prose only and can never change trip
  state except through validated tools.
- General/destination questions are answered conversationally by the LLM
  directly, grounded in tool facts, with history.
"""

import time
import uuid
from typing import Any, AsyncIterator

from app.ai.memory import conversation as conversation_memory
from app.ai.memory import trip as trip_memory
from app.ai.prompts.system import CONCIERGE_PROMPT, PROMPT_VERSION, SYSTEM_PROMPT
from app.ai.providers import get_provider_chain
from app.ai.providers.base import AIProvider, AIProviderError
from app.ai.schemas.actions import UIAction
from app.ai.schemas.intent import IntentType, TravelIntent
from app.ai.schemas.responses import AIResponse
from app.ai.tools.registry import call_tool
from app.ai.workflows.trip_planning import get_trip_graph

SAFE_PROGRESS = {
    "Understanding your trip",
    "Searching stays",
    "Building itinerary",
    "Checking budget",
    "Finding suitable options",
}

CONVERSATIONAL_INTENTS = {
    IntentType.GENERAL_TRAVEL_QUESTION,
    IntentType.DESTINATION_QUESTION,
}


class AIUnavailable(RuntimeError):
    """All LLM providers failed (or the workflow broke). Never fabricate —
    the router turns this into a retryable 503."""


def _request_id() -> str:
    return f"req_{uuid.uuid4().hex[:12]}"


class TripifiAIGateway:
    def __init__(self, provider: AIProvider | None = None, chain: list[AIProvider] | None = None):
        if chain is not None:
            self.chain = chain
        elif provider is not None:
            self.chain = [provider]
        else:
            self.chain = get_provider_chain()
        self.provider = self.chain[0]
        self.served_by: str | None = None

    async def _chat_chain(self, messages: list[dict[str, str]], **kwargs: Any) -> tuple[dict[str, Any], str]:
        """Try each provider in order; first answer wins. Raises AIUnavailable."""
        errors: list[str] = []
        for candidate in self.chain:
            try:
                result = await candidate.chat(messages, **kwargs)
                content = (result.get("content") or "").strip()
                if not content:
                    errors.append(f"{candidate.name}:empty")
                    continue
                self.provider = candidate
                self.served_by = candidate.name
                return result, candidate.name
            except AIProviderError as e:
                errors.append(f"{candidate.name}:{e.kind}")
        raise AIUnavailable(f"all_providers_failed ({'; '.join(errors)})")

    async def _narrate(self, prompt: str, fallback: str) -> tuple[str, bool]:
        """LLM prose layer over the chain. Any failure returns (fallback, False)."""
        try:
            result, _ = await self._chat_chain(
                [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": prompt},
                ],
                max_tokens=300,
            )
            return result.get("content", "").strip(), True
        except AIUnavailable:
            return fallback, False

    async def _gather_facts(self, intent: TravelIntent, message: str) -> tuple[str, list[str]]:
        """Tool-grounded facts for conversational answers. Never raises."""
        blocks: list[str] = []
        sources: list[str] = []
        slug = intent.destination_slug
        if slug:
            try:
                details = await call_tool("get_destination_details", slug=slug)
            except Exception:
                details = {"found": False}
            if details.get("found"):
                blocks.append(
                    "DESTINATION (Tripifi catalog, sample planning data): "
                    f"{details.get('name')} — themes {details.get('themes', [])}, "
                    f"typical {details.get('days_min')}-{details.get('days_max')} days."
                )
                sources.append("tripifi-catalog")
            try:
                weather = await call_tool("get_destination_weather", destination=details.get("name", slug) if details.get("found") else slug)
            except Exception:
                weather = {"available": False}
            if weather.get("available"):
                days = "; ".join(
                    f"{d.get('date')}: {d.get('condition')}, {d.get('tmin_c')}–{d.get('tmax_c')}C"
                    for d in (weather.get("daily") or [])[:3]
                )
                blocks.append(
                    f"WEATHER NOW (live, {weather.get('attribution', 'Open-Meteo')}): "
                    f"{weather.get('current_temp_c')}C, {weather.get('current_condition')}. "
                    f"Next days: {days}."
                )
                sources.append("open-meteo")
            else:
                blocks.append("WEATHER: live weather is currently unavailable — say so, do not guess.")
        else:
            try:
                found = await call_tool("search_destinations", query=message[:80])
            except Exception:
                found = {"destinations": []}
            names = [d.get("name") for d in (found.get("destinations") or [])[:4] if d.get("name")]
            if names:
                blocks.append(f"TRIPIFI COVERS (catalog): {', '.join(names)}. Anything else is outside Tripifi planning data.")
                sources.append("tripifi-catalog")
        return ("\n".join(blocks), sources)

    async def _answer_conversational(
        self,
        intent: TravelIntent,
        message: str,
        conversation_id: str,
        request_id: str,
        emit: Any,
    ) -> AIResponse:
        facts, fact_sources = await self._gather_facts(intent, message)
        history = conversation_memory.get_history(conversation_id, limit=10)
        messages: list[dict[str, str]] = [{"role": "system", "content": CONCIERGE_PROMPT}]
        for entry in history[-6:]:
            role = str(entry.get("role", "")).upper()
            if role == "USER":
                messages.append({"role": "user", "content": str(entry.get("content", ""))})
            elif role == "ASSISTANT":
                messages.append({"role": "assistant", "content": str(entry.get("content", ""))})
        question = f"FACTS:\n{facts}\n\nQUESTION: {message}" if facts else f"QUESTION: {message}"
        messages.append({"role": "user", "content": question})
        try:
            result, served = await self._chat_chain(messages)
        except AIUnavailable as e:
            conversation_memory.append_message(conversation_id, "ASSISTANT", "Tripifi AI is temporarily unavailable. Please try again in a moment.")
            await emit("AI_ERROR", {"request_id": request_id, "error": "providers_unavailable"})
            raise
        answer = (result.get("content") or "").strip()
        sources = [served, *[s for s in fact_sources if s not in (served,)]]
        # Sample/estimated grounding present -> still demo-flavoured; pure
        # LLM knowledge (no tool facts) is a live model answer.
        is_demo = bool(fact_sources)
        response = AIResponse(
            message=answer,
            intent=intent.intent.value,
            actions=[],
            cards=[],
            trip_update=None,
            sources=sources,
            requires_confirmation=False,
            is_demo=is_demo,
            narrated_live=True,
            request_id=request_id,
            prompt_version=PROMPT_VERSION,
        )
        conversation_memory.append_message(conversation_id, "ASSISTANT", answer, {"intent": intent.intent.value})
        await emit("AI_MESSAGE", {"request_id": request_id})
        return response

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
            raise AIUnavailable(f"workflow_failed: {e}") from e

        intent = final.get("intent")
        intent_name = intent.intent.value if intent else IntentType.GENERAL_TRAVEL_QUESTION.value
        await emit("INTENT_DETECTED", {"request_id": request_id, "intent": intent_name})

        # Conversational path: general/destination questions get a direct,
        # tool-grounded LLM answer with history — never a rephrased plan.
        # Plans for places outside the catalog also go conversational: the LLM
        # answers from its own knowledge instead of a defaulted Sikkim plan.
        plan_intent = intent.intent if intent else IntentType.GENERAL_TRAVEL_QUESTION
        unknown_place_plan = (
            plan_intent == IntentType.PLAN_TRIP
            and (intent.destination if intent else None)
            and not (intent.destination_slug if intent else None)
        )
        if plan_intent in CONVERSATIONAL_INTENTS or unknown_place_plan:
            response = await self._answer_conversational(
                intent if intent else TravelIntent(intent=IntentType.GENERAL_TRAVEL_QUESTION),
                message, conversation_id, request_id, emit,
            )
            latency_ms = int((time.monotonic() - started) * 1000)
            await emit("AI_COMPLETED", {"request_id": request_id, "latency_ms": latency_ms})
            print(f"[ai] request_id={request_id} intent={intent_name} latency_ms={latency_ms} "
                  f"provider={self.served_by} mode=conversational")
            return response

        deterministic_message: str = final.get("response", "")
        narration, narrated_live = await self._narrate(
            f"Rephrase concisely for a traveller (2-4 sentences, no new facts, no prices, no availability claims): {deterministic_message}",
            deterministic_message,
        )
        await emit("AI_MESSAGE", {"request_id": request_id})

        actions = [UIAction(**a) if isinstance(a, dict) else a for a in final.get("actions", [])]
        served = self.served_by or self.provider.name
        response = AIResponse(
            message=narration,
            intent=intent_name,
            actions=actions,
            cards=final.get("cards", []),
            trip_update=final.get("trip_state"),
            sources=["tripifi-demo-data", served] if narrated_live else ["tripifi-demo-data"],
            requires_confirmation=any(a.requires_confirmation for a in actions),
            is_demo=True,
            narrated_live=narrated_live,
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
              f"provider={self.served_by or self.provider.name} actions={len(actions)} mode=workflow")
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
        except AIUnavailable:
            yield {"event": "AI_ERROR", "data": {"message": "Tripifi AI is temporarily unavailable. All providers failed — please retry in a moment.", "retryable": True}}
            return
        for item in queue:
            yield item
        yield {"event": "AI_RESULT", "data": response.model_dump()}
