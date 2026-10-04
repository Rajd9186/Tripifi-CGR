# Tripifi AI Architecture

> The intelligence layer of Tripifi CGR. Facts are deterministic; the LLM narrates prose only.

## Layers

```text
Next.js (src/lib/ai/*, TripifiAI.tsx)
    │ REST + SSE
    ▼
FastAPI (/api/v1/ai/*)
    ▼
TripifiAIGateway (backend/app/ai/gateway.py)
    ├── Intent Engine (agents/intent.py — deterministic first)
    ├── Conversation / Trip / User memory (ai/memory/*)
    ├── LangGraph Orchestrator (ai/workflows/trip_planning.py)
    ├── Tool Registry (ai/tools/registry.py)
    ├── AI Provider (ai/providers/* — Ollama today)
    └── Response Formatter (deterministic cards + actions)
```

## Key invariants

- **UI depends on `AIProvider`, never `OllamaProvider`.** Swap providers without touching the gateway.
- **No free-form AI dicts become app state.** Intent, actions, and responses are Pydantic schemas (`ai/schemas/*`).
- **Budget math is code** (`calculate_trip_budget`), never LLM arithmetic.
- **Destructive tools need confirmation** (`REMOVE_ITEM` → `requires_confirmation`, confirm/reject endpoints).
- **Demo data is always labeled** (`is_demo`, `source: "DEMO"`); the AI never claims live availability or completed bookings.
- **Secrets stay server-side.** The browser talks to Tripifi's backend only — never `NEXT_PUBLIC_OLLAMA_*`.

## Workflow

`LOAD_CONTEXT → CLASSIFY_INTENT → PLAN → TOOLS → VALIDATE → FORMAT → SAVE` with a conditional edge that asks for missing info instead of running tools. Node outputs are merged into full state (LangGraph dict-state replaces on write in this version — each node spreads prior state).

## SSE events

`AI_STARTED, CONTEXT_LOADED, INTENT_DETECTED, SEARCHING_*, BUILDING_ITINERARY, CALCULATING_BUDGET, AI_MESSAGE, AI_RESULT, AI_COMPLETED, AI_ERROR`. Progress labels in `src/lib/ai/events.ts` expose only safe high-level status.

## Local setup

```bash
# Ollama running locally; model from OLLAMA_MODEL (default qwen2.5:3b)
uvicorn app.main:app --reload   # backend
npm run dev                     # frontend (NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1)
```

Without Ollama or the backend, the UI falls back to deterministic local planning with a visible "Demo planning" label.

## Testing

- `backend/tests/test_ai_core.py` + `tests/ai/*.json` eval sets (intent, planning, budget, modification, hallucination).
- `PROMPT_VERSION = "tripifi-ai-v1"` is recorded on every response for traceability.
