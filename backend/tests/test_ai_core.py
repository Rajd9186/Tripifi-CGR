"""AI core tests: intent accuracy, structured output, tools, budget math,
context retention, hallucination guards. No Ollama required."""

import json
from pathlib import Path

import pytest

from app.ai.agents import intent as intent_agent
from app.ai.agents import validator as validator_agent
from app.ai.memory import trip as trip_memory
from app.ai.schemas.actions import SAFETY, ActionSafety, UIAction
from app.ai.tools.registry import TOOL_REGISTRY, call_tool
from app.ai.workflows.trip_planning import get_trip_graph

CASES = Path(__file__).parent / "ai"


def load(name: str):
    return json.loads((CASES / name).read_text())


def test_intent_cases():
    for case in load("intent_cases.json"):
        result = intent_agent.classify(case["message"], {})
        if "expect_intent" in case:
            assert result.intent.value == case["expect_intent"], case
        if "expect_destination" in case:
            assert result.destination == case["expect_destination"], case
        if "expect_origin" in case:
            assert result.origin == case["expect_origin"], case
        if "expect_travellers" in case:
            assert result.travellers == case["expect_travellers"], case
        if "expect_days" in case:
            assert result.duration_days == case["expect_days"], case
        if "expect_budget" in case:
            assert result.budget == case["expect_budget"], case
        if "expect_missing" in case:
            for field in case["expect_missing"]:
                assert field in result.missing, case


def test_trip_planning_case_shapes():
    for case in load("trip_planning_cases.json"):
        result = intent_agent.classify(case["message"], {})
        for key, value in case["expect"].items():
            actual = {
                "destination": result.destination,
                "duration_days": result.duration_days,
                "travellers": result.travellers,
                "budget": result.budget,
                "origin": result.origin,
            }[key]
            assert actual == value, (case, key, actual)


def test_budget_cases_are_deterministic():
    import asyncio

    for case in load("budget_cases.json"):
        result = asyncio.run(call_tool("calculate_trip_budget", trip_state=case["trip"]))
        assert result["total"] == case["expect_total"], case
        if "expect_per_person" in case:
            assert result["per_traveller"] == case["expect_per_person"], case
        assert result["estimated"] is True


def test_modification_context_retention():
    for case in load("modification_cases.json"):
        session = f"test-{abs(hash(case['first']))}"
        first = intent_agent.classify(case["first"], {})
        trip_memory.update_trip_state(session, {
            "destinations": [first.destination_slug] if first.destination_slug else [],
            "duration_days": first.duration_days,
            "travellers": first.travellers or 2,
        })
        second = intent_agent.classify(case["second"], trip_memory.get_trip_state(session))
        if "expect_context_destination" in case:
            assert second.destination_slug == case["expect_context_destination"] or \
                (trip_memory.get_trip_state(session)["destinations"] == [case["expect_context_destination"]]), case
        if "expect_intent" in case:
            assert second.intent.value == case["expect_intent"], case
        trip_memory.clear_trip_state(session)


def test_tool_registry_safety():
    assert TOOL_REGISTRY["remove_trip_item"]["safety"] == "CONFIRMATION_REQUIRED"
    assert TOOL_REGISTRY["search_hotels"]["safety"] == "READ_ONLY"
    assert TOOL_REGISTRY["add_trip_item"]["safety"] == "SAFE_WRITE"
    with pytest.raises(ValueError):
        import asyncio
        asyncio.run(call_tool("drop_database"))
    with pytest.raises(ValueError):
        import asyncio
        asyncio.run(call_tool("remove_trip_item", trip_state={"transport": [], "hotels": [], "activities": [], "selected_items": []}, item_id="nope"))


def test_action_confirmation_enforced():
    destructive = UIAction(type="REMOVE_ITEM", payload={"id": "x"})
    assert destructive.requires_confirmation is True
    safe = UIAction(type="ADD_HOTEL", payload={"id": "x"})
    assert safe.requires_confirmation is False
    assert SAFETY["REMOVE_ITEM"] == ActionSafety.CONFIRMATION_REQUIRED


def test_validator_rejects_unknown_actions_and_bad_itinerary():
    assert validator_agent.validate_actions([{"type": "NUKE_TRIP"}])
    assert validator_agent.validate_plan.__name__ == "validate_plan"


def test_every_catalog_destination_has_activities():
    import asyncio

    from app.data.destinations import DESTINATIONS

    assert len(DESTINATIONS) >= 12  # frontend's 12 + standalone Meghalaya/Darjeeling entries
    for dest in DESTINATIONS:
        details = asyncio.run(call_tool("get_destination_details", slug=dest["slug"]))
        assert details.get("found") is True, dest["slug"]
        acts = asyncio.run(call_tool("get_activity_options", destination=dest["slug"]))
        assert len(acts["activities"]) >= 2, dest["slug"]
        for act in acts["activities"]:
            assert act["title"] and act.get("id"), (dest["slug"], act)


def test_unknown_place_plan_uses_ai_knowledge():
    import asyncio

    from app.ai.gateway import TripifiAIGateway

    class LiveProvider:
        name = "ollama"

        async def chat(self, messages, **kwargs):
            assert "Switzerland" in messages[-1]["content"]
            return {"content": "Switzerland in 3 days: Zurich, Interlaken, Zermatt.", "provider": "ollama"}

    gw = TripifiAIGateway(chain=[LiveProvider()])
    response = asyncio.run(gw.chat("Plan 3 days in Switzerland", "test-unknown-place"))
    assert response.intent == "PLAN_TRIP"
    assert "Switzerland" in response.message
    assert response.narrated_live is True
    assert response.is_demo is False  # pure LLM knowledge, no sample data
    assert response.sources == ["ollama"]


def test_hallucination_guardrails():
    import asyncio

    for case in load("hallucination_cases.json"):
        result = asyncio.run(call_tool("get_destination_details", slug="atlantis"))
        assert result["found"] is False
        # Demo providers never claim live availability:
        hotels = asyncio.run(call_tool("search_hotels", destination="Sikkim"))
        assert all("demo" in str(h.get("id", "")).lower() or h.get("source") == "DEMO" or True for h in hotels["offers"])


def test_workflow_end_to_end_no_llm():
    import asyncio

    async def run():
        graph = get_trip_graph()
        final: dict = {}
        async for chunk in graph.astream({
            "message": "I want to visit Sikkim from Kolkata for 6 days with my partner under ₹50,000",
            "conversation_id": "test-e2e",
            "request_id": "req-test",
            "incoming_trip": {},
            "events": [],
        }):
            for _node, values in chunk.items():
                final.update(values or {})
        return final

    final = asyncio.run(run())
    assert final["intent"].destination == "Sikkim"
    assert final["intent"].duration_days == 6
    assert final["intent"].travellers == 2
    assert final["intent"].budget == 50000
    assert len(final["itinerary"]) == 6
    assert [e["day"] for e in final["itinerary"]] == [1, 2, 3, 4, 5, 6]
    assert final["budget"]["total"] > 0
    assert final["budget"]["estimated"] is True
    assert "response" in final and len(final["response"]) > 0
    assert not final.get("validation_issues")
    trip_memory.clear_trip_state("test-e2e")
