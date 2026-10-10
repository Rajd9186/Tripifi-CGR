"""LangGraph trip-planning workflow.

START → LOAD_CONTEXT → CLASSIFY_INTENT → PLAN → TOOLS → VALIDATE
→ FORMAT_RESPONSE → SAVE_STATE → END

Conditional edges skip the tool fan-out when information is missing
or a destructive action awaits confirmation.
"""

from typing import Any

from langgraph.graph import END, StateGraph

from app.ai.agents import budget as budget_agent
from app.ai.agents import intent as intent_agent
from app.ai.agents import itinerary as itinerary_agent
from app.ai.agents import planner as planner_agent
from app.ai.agents import researcher as researcher_agent
from app.ai.agents import validator as validator_agent
from app.ai.memory import trip as trip_memory
from app.ai.schemas.intent import IntentType
from app.ai.tools.registry import call_tool


async def load_context(state: dict) -> dict:
    session_id: str = state.get("conversation_id", "default")
    stored = trip_memory.get_trip_state(session_id)
    incoming = state.get("incoming_trip") or {}
    merged = {**stored, **{k: v for k, v in incoming.items() if v is not None}}
    trip_memory.update_trip_state(session_id, merged)
    return {**state, "trip_state": merged}


async def classify_intent(state: dict) -> dict:
    intent = intent_agent.classify(state.get("message", ""), state.get("trip_state", {}))
    needs_info = bool(intent.missing) and intent.intent == IntentType.PLAN_TRIP
    return {**state, "intent": intent, "needs_info": needs_info}


async def plan(state: dict) -> dict:
    intent = state["intent"]
    research = await researcher_agent.research_destination(intent.destination_slug)
    plan_data = await planner_agent.build_plan(intent, research, state.get("trip_state", {}))
    return {**state, "plan": plan_data, "research": research}


async def run_tools(state: dict) -> dict:
    intent = state["intent"]
    trip_state = dict(state.get("trip_state", {}))
    results: dict[str, Any] = {}
    events: list[str] = list(state.get("events", []))

    slug = intent.destination_slug
    # Display label prefers the proper name ("Rajasthan", not "rajasthan").
    dest_label = intent.destination or slug or "sikkim"
    if slug:
        results["destination"] = await call_tool("get_destination_details", slug=slug)
        results["activities"] = await call_tool("get_activity_options", destination=slug)
        events.append("SEARCHING_DESTINATIONS")

    origin = intent.origin or trip_state.get("origin") or "Kolkata"
    if intent.intent in (IntentType.PLAN_TRIP, IntentType.SEARCH_FLIGHT):
        results["flights"] = await call_tool(
            "search_flights", origin=origin, destination=slug or "sikkim", date=None
        )
        events.append("SEARCHING_TRANSPORT")
    if intent.intent in (IntentType.PLAN_TRIP, IntentType.SEARCH_HOTEL):
        results["hotels"] = await call_tool("search_hotels", destination=dest_label)
        events.append("SEARCHING_HOTELS")

    await call_tool("create_trip", trip_state=trip_state, patch={
        "origin": origin,
        "destinations": [slug] if slug else trip_state.get("destinations", []),
        "duration_days": intent.duration_days or trip_state.get("duration_days"),
        "travellers": intent.travellers or trip_state.get("travellers", 2),
        "traveller_type": intent.traveller_type,
        "budget": intent.budget if intent.budget is not None else trip_state.get("budget"),
    })

    # Seed indicative priced selections so the budget is meaningful.
    # These are estimates from demo providers, never confirmed prices.
    flights = (results.get("flights") or {}).get("offers", [])
    if flights:
        cheapest = min(flights, key=lambda o: o.get("fare", 0) or 0)
        trip_state.setdefault("transport", []).append({
            "id": cheapest["id"], "kind": "flight",
            "title": f"{cheapest.get('airline')} {cheapest.get('flight_number')}",
            "amount": cheapest.get("fare", 0), "estimated": True, "source": "DEMO",
        })
    hotels = (results.get("hotels") or {}).get("offers", [])
    if hotels:
        pick = hotels[0]
        trip_state.setdefault("hotels", []).append({
            "id": pick["id"], "kind": "hotel",
            "title": pick.get("name", "Hotel"),
            "amount": pick.get("total_price", 0), "estimated": True, "source": "DEMO",
        })
    acts = (results.get("activities") or {}).get("activities", [])
    for act in acts[:2]:
        trip_state.setdefault("activities", []).append({
            "id": act.get("id", act.get("title", "")), "kind": "activity",
            "title": act.get("title", "Activity"),
            "amount": act.get("price", 0), "estimated": True, "source": "DEMO",
        })
    days = intent.duration_days or trip_state.get("duration_days") or 5
    activities = (results.get("activities") or {}).get("activities", [])
    itinerary = await itinerary_agent.build_itinerary(dest_label, days, activities)
    await call_tool("create_itinerary", trip_state=trip_state, days=[{"day": e["day"], "title": e["title"]} for e in itinerary])
    events.append("BUILDING_ITINERARY")

    budget = await budget_agent.price_trip(trip_state)
    events.append("CALCULATING_BUDGET")

    session_id: str = state.get("conversation_id", "default")
    trip_memory.update_trip_state(session_id, trip_state)
    return {**state, "tool_results": results, "trip_state": trip_state, "itinerary": itinerary, "budget": budget, "events": events}


async def validate(state: dict) -> dict:
    issues = validator_agent.validate_plan(
        state["intent"], state.get("trip_state", {}),
        state.get("budget", {}), state.get("itinerary", []),
    )
    action_issues = validator_agent.validate_actions([a for a in state.get("actions", [])])
    return {**state, "validation_issues": issues + action_issues}


async def format_response(state: dict) -> dict:
    from app.ai.schemas.actions import UIAction
    from app.ai.schemas.responses import ResponseCard

    intent = state["intent"]
    budget = state.get("budget", {})
    itinerary = state.get("itinerary", [])
    tool_results = state.get("tool_results", {})
    trip_state = state.get("trip_state", {})

    if state.get("needs_info"):
        missing = ", ".join(intent.missing)
        return {
            **state,
            "response": f"Absolutely — I can plan that. To build the right trip, could you tell me your {missing}?",
            "actions": [],
            "cards": [],
        }

    dest_name = (tool_results.get("destination") or {}).get("name") or intent.destination or "your destination"
    total = budget.get("total", 0)
    travellers = trip_state.get("travellers", 2)
    per_person = (total + travellers - 1) // travellers if travellers else total
    has_pricing = total > 0

    lines = [f"I've drafted your {dest_name} trip — {len(itinerary)} days for {travellers} traveller(s)."]
    if intent.assumptions:
        lines.append("Note: " + " ".join(intent.assumptions))
    if has_pricing:
        lines.append(f"Estimated total ₹{total:,} (₹{per_person:,} per person, sample pricing).")
    else:
        lines.append("Live pricing isn't available for these services — raise an assisted enquiry and a travel associate will confirm exact fares.")
    if state.get("validation_issues"):
        lines.append("I flagged a couple of details to review in the Trip Builder.")
    lines.append("Open the Trip Builder to customize day by day, or ask me to make it cheaper.")
    if intent.budget and has_pricing and total > intent.budget:
        lines.append(f"This is over your ₹{intent.budget:,} budget — ask me to optimize and I'll find real savings.")

    cards = [
        ResponseCard(
            kind="destination",
            title=dest_name,
            subtitle=f"{len(itinerary)} days" + (f" · From ₹{total:,} estimated" if has_pricing else " · Pricing on request"),
            details={"days": len(itinerary), "travellers": travellers},
            actions=[UIAction(type="OPEN_TRIP", payload={})],
        ).model_dump(),
        ResponseCard(
            kind="budget",
            title=f"Estimated total ₹{total:,}" if has_pricing else "Pricing on request — raise an enquiry",
            subtitle=f"₹{per_person:,} per person" if has_pricing else "A travel associate will confirm exact fares",
            details={k: budget.get(k, 0) for k in ("transport", "hotels", "activities", "taxes")},
            actions=[UIAction(type="OPTIMIZE_TRIP", payload={"target": intent.budget} if intent.budget else {})],
        ).model_dump(),
        ResponseCard(
            kind="itinerary",
            title=f"{len(itinerary)}-day outline",
            subtitle=" · ".join(e["title"] for e in itinerary[:3]) + (" …" if len(itinerary) > 3 else ""),
            details={"days": "; ".join(f"Day {e['day']}: {e['title']}" for e in itinerary)},
            actions=[UIAction(type="OPEN_TRIP", payload={})],
        ).model_dump(),
    ]
    actions = [
        UIAction(type="OPEN_TRIP", payload={}).model_dump(),
        UIAction(type="REQUEST_BOOKING", payload={"destination": intent.destination_slug}).model_dump(),
    ]
    return {**state, "response": " ".join(lines), "actions": actions, "cards": cards}


async def save_state(state: dict) -> dict:
    return {**state}


def _needs_tools(state: dict) -> str:
    intent = state.get("intent")
    if intent is None:
        return "ask"
    if state.get("needs_info"):
        return "ask"
    if intent.intent in (IntentType.GENERAL_TRAVEL_QUESTION, IntentType.DESTINATION_QUESTION, IntentType.VIEW_TRIP):
        return "ask"
    return "tools"


def build_trip_planning_graph():
    graph = StateGraph(dict)
    graph.add_node("load_context", load_context)
    graph.add_node("classify_intent", classify_intent)
    graph.add_node("plan", plan)
    graph.add_node("tools", run_tools)
    graph.add_node("validate", validate)
    graph.add_node("format", format_response)
    graph.add_node("save", save_state)

    graph.set_entry_point("load_context")
    graph.add_edge("load_context", "classify_intent")
    graph.add_conditional_edges("classify_intent", _needs_tools, {"tools": "plan", "ask": "format"})
    graph.add_edge("plan", "tools")
    graph.add_edge("tools", "validate")
    graph.add_edge("validate", "format")
    graph.add_edge("format", "save")
    graph.add_edge("save", END)
    return graph.compile()


_trip_graph = None


def get_trip_graph():
    global _trip_graph
    if _trip_graph is None:
        _trip_graph = build_trip_planning_graph()
    return _trip_graph
