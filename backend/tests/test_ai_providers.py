"""AI provider tests: Groq + NVIDIA (OpenAI-compatible) and provider selection.
No network, no keys required — httpx is stubbed."""

import asyncio
import json

import pytest

from app.ai.gateway import TripifiAIGateway
from app.ai.providers.base import AIProviderError
from app.ai.providers.groq import GroqProvider
from app.ai.providers.nvidia import NvidiaProvider
from app.ai.providers.ollama import OllamaError, OllamaProvider
from app.core.config import get_settings


class FakeResponse:
    def __init__(self, status_code, payload):
        self.status_code = status_code
        self._payload = payload

    def json(self):
        if isinstance(self._payload, Exception):
            raise self._payload
        return self._payload


class FakeStreamResponse:
    def __init__(self, status_code, lines):
        self.status_code = status_code
        self._lines = lines

    async def __aenter__(self):
        return self

    async def __aexit__(self, *args):
        return False

    async def aiter_lines(self):
        for line in self._lines:
            yield line


class FakeClient:
    """Drop-in for httpx.AsyncClient. Configure per-test via .behavior."""

    behavior = {"post": None, "get": None, "stream": None}
    seen = {}

    def __init__(self, *args, **kwargs):
        pass

    async def __aenter__(self):
        return self

    async def __aexit__(self, *args):
        return False

    async def post(self, url, headers=None, json=None):
        FakeClient.seen = {"url": url, "headers": headers, "json": json}
        outcome = FakeClient.behavior["post"]
        if isinstance(outcome, Exception):
            raise outcome
        return outcome

    async def get(self, url, headers=None):
        FakeClient.seen = {"url": url, "headers": headers}
        outcome = FakeClient.behavior["get"]
        if isinstance(outcome, Exception):
            raise outcome
        return outcome

    def stream(self, method, url, headers=None, json=None):
        FakeClient.seen = {"url": url, "headers": headers, "json": json}
        outcome = FakeClient.behavior["stream"]
        if isinstance(outcome, Exception):
            raise outcome
        return outcome


@pytest.fixture(autouse=True)
def _stub_http(monkeypatch):
    import httpx

    FakeClient.behavior = {"post": None, "get": None, "stream": None}
    FakeClient.seen = {}
    monkeypatch.setattr(httpx, "AsyncClient", FakeClient)
    monkeypatch.setenv("GROQ_API_KEY", "test-groq-key")
    monkeypatch.setenv("NVIDIA_API_KEY", "test-nvidia-key")
    get_settings.cache_clear()
    yield
    get_settings.cache_clear()


def run(coro):
    return asyncio.run(coro)


def chat_payload(content="Hello, traveller!"):
    return {"choices": [{"message": {"content": content}}]}


def test_ollama_error_is_provider_error():
    assert issubclass(OllamaError, AIProviderError)
    assert OllamaProvider().name == "ollama"


def test_groq_chat_success_shape():
    FakeClient.behavior["post"] = FakeResponse(200, chat_payload())
    result = run(GroqProvider().chat([{"role": "user", "content": "hi"}]))
    assert result["content"] == "Hello, traveller!"
    assert result["provider"] == "groq"
    assert result["model"] == "llama-3.3-70b-versatile"
    assert FakeClient.seen["url"].endswith("/chat/completions")
    assert FakeClient.seen["headers"]["Authorization"] == "Bearer test-groq-key"


def test_groq_missing_key_is_auth_error(monkeypatch):
    monkeypatch.setenv("GROQ_API_KEY", "")
    get_settings.cache_clear()
    with pytest.raises(AIProviderError) as e:
        run(GroqProvider().chat([{"role": "user", "content": "hi"}]))
    assert e.value.kind == "AUTH_ERROR"


def test_groq_status_mapping():
    import httpx

    FakeClient.behavior["post"] = FakeResponse(401, {})
    with pytest.raises(AIProviderError) as e:
        run(GroqProvider().chat([{"role": "user", "content": "hi"}]))
    assert e.value.kind == "AUTH_ERROR"

    FakeClient.behavior["post"] = FakeResponse(429, {})
    with pytest.raises(AIProviderError) as e:
        run(GroqProvider().chat([{"role": "user", "content": "hi"}]))
    assert e.value.kind == "MODEL_ERROR"

    FakeClient.behavior["post"] = httpx.ConnectError("down")
    with pytest.raises(AIProviderError) as e:
        run(GroqProvider().chat([{"role": "user", "content": "hi"}]))
    assert e.value.kind == "UNAVAILABLE"

    FakeClient.behavior["post"] = FakeResponse(200, ValueError("nope"))
    with pytest.raises(AIProviderError) as e:
        run(GroqProvider().chat([{"role": "user", "content": "hi"}]))
    assert e.value.kind == "BAD_RESPONSE"


def test_groq_stream_parses_sse():
    lines = [
        'data: {"choices": [{"delta": {"content": "Hello"}}]}',
        "",
        'data: {"choices": [{"delta": {"content": " there"}}]}',
        "data: [DONE]",
    ]
    FakeClient.behavior["stream"] = FakeStreamResponse(200, lines)
    events = run(_collect(GroqProvider().stream([{"role": "user", "content": "hi"}])))
    assert [e.get("delta") for e in events if "delta" in e] == ["Hello", " there"]
    assert events[-1]["done"] is True


async def _collect(aiter):
    return [item async for item in aiter]


def test_groq_structured_parses_and_rejects():
    schema = {"type": "object"}
    FakeClient.behavior["post"] = FakeResponse(200, chat_payload('{"city": "Gangtok"}'))
    assert run(GroqProvider().structured([{"role": "user", "content": "hi"}], schema)) == {"city": "Gangtok"}

    FakeClient.behavior["post"] = FakeResponse(200, chat_payload("not json at all"))
    with pytest.raises(AIProviderError) as e:
        run(GroqProvider().structured([{"role": "user", "content": "hi"}], schema))
    assert e.value.kind == "BAD_RESPONSE"


def test_groq_tool_call_passthrough():
    payload = {"choices": [{"message": {"content": "", "tool_calls": [{"id": "1", "type": "function"}]}}]}
    FakeClient.behavior["post"] = FakeResponse(200, payload)
    result = run(GroqProvider().tool_call([{"role": "user", "content": "hi"}], tools=[{"type": "function"}]))
    assert result["tool_calls"] == [{"id": "1", "type": "function"}]
    assert result["provider"] == "groq"
    assert FakeClient.seen["json"]["tools"] == [{"type": "function"}]


def test_nvidia_defaults_and_health():
    assert NvidiaProvider().name == "nvidia"
    assert NvidiaProvider()._model() == "meta/llama-3.3-70b-instruct"

    FakeClient.behavior["get"] = FakeResponse(
        200, {"data": [{"id": "meta/llama-3.3-70b-instruct"}]}
    )
    health = run(NvidiaProvider().health())
    assert health == {
        "provider": "nvidia",
        "configured": True,
        "model": "meta/llama-3.3-70b-instruct",
        "reachable": True,
        "model_available": True,
    }


def test_nvidia_health_unconfigured(monkeypatch):
    monkeypatch.setenv("NVIDIA_API_KEY", "")
    get_settings.cache_clear()
    health = run(NvidiaProvider().health())
    assert health["configured"] is False
    assert health["reachable"] is False


def test_factory_selection(monkeypatch):
    from app.ai.providers import get_ai_provider, get_provider_chain

    monkeypatch.setenv("AI_PROVIDER", "groq")
    get_settings.cache_clear()
    assert get_ai_provider().name == "groq"

    monkeypatch.setenv("AI_PROVIDER", "nvidia")
    get_settings.cache_clear()
    assert get_ai_provider().name == "nvidia"

    # Requested provider without a key: Ollama leads the chain now.
    monkeypatch.setenv("AI_PROVIDER", "groq")
    monkeypatch.setenv("GROQ_API_KEY", "")
    get_settings.cache_clear()
    assert get_ai_provider().name == "ollama"
    assert [p.name for p in get_provider_chain()] == ["ollama", "nvidia"]

    # No keys at all -> Ollama only (fails safe at call time).
    monkeypatch.setenv("GROQ_API_KEY", "")
    monkeypatch.setenv("NVIDIA_API_KEY", "")
    get_settings.cache_clear()
    assert get_ai_provider().name == "ollama"
    assert [p.name for p in get_provider_chain()] == ["ollama"]

    # All keyed, default preference -> ollama, groq, nvidia.
    monkeypatch.setenv("AI_PROVIDER", "ollama")
    monkeypatch.setenv("GROQ_API_KEY", "g")
    monkeypatch.setenv("NVIDIA_API_KEY", "n")
    get_settings.cache_clear()
    assert [p.name for p in get_provider_chain()] == ["ollama", "groq", "nvidia"]


def test_gateway_narration_flag():
    class LiveProvider:
        name = "groq"

        async def chat(self, messages, **kwargs):
            return {"content": "Sure, here is your trip.", "provider": "groq"}

    class DeadProvider:
        name = "nvidia"

        async def chat(self, messages, **kwargs):
            raise AIProviderError("UNAVAILABLE", "down")

    text, live = asyncio.run(TripifiAIGateway(provider=LiveProvider())._narrate("hi", "fallback"))
    assert (text, live) == ("Sure, here is your trip.", True)

    text, live = asyncio.run(TripifiAIGateway(provider=DeadProvider())._narrate("hi", "fallback"))
    assert (text, live) == ("fallback", False)


def test_chain_skips_dead_provider():
    from app.ai.gateway import AIUnavailable, TripifiAIGateway

    class DeadProvider:
        name = "ollama"

        async def chat(self, messages, **kwargs):
            raise AIProviderError("UNAVAILABLE", "local down")

    class LiveProvider:
        name = "groq"

        async def chat(self, messages, **kwargs):
            return {"content": "hello from groq", "provider": "groq"}

    gw = TripifiAIGateway(chain=[DeadProvider(), LiveProvider()])
    result, served = asyncio.run(gw._chat_chain([{"role": "user", "content": "hi"}]))
    assert served == "groq"
    assert result["content"] == "hello from groq"
    assert gw.served_by == "groq"


def test_chain_all_dead_raises():
    from app.ai.gateway import AIUnavailable, TripifiAIGateway

    class DeadProvider:
        name = "ollama"

        async def chat(self, messages, **kwargs):
            raise AIProviderError("TIMEOUT", "down")

    gw = TripifiAIGateway(chain=[DeadProvider()])
    try:
        asyncio.run(gw._chat_chain([{"role": "user", "content": "hi"}]))
    except AIUnavailable:
        return
    raise AssertionError("expected AIUnavailable")


def test_conversational_answer_grounded():
    from app.ai.gateway import TripifiAIGateway

    class LiveProvider:
        name = "ollama"

        async def chat(self, messages, **kwargs):
            # Echo proves the LLM answers directly (not a rephrase template).
            user = messages[-1]["content"]
            assert "QUESTION:" in user
            return {"content": "Ladakh is best visited May to September.", "provider": "ollama"}

    async def fake_weather(destination: str):
        return {"available": False, "reason": "weather:unavailable"}

    import app.ai.gateway as gateway_module

    real_call_tool = gateway_module.call_tool

    async def fake_call_tool(name: str, **kwargs):
        if name == "get_destination_weather":
            return await fake_weather(kwargs.get("destination", ""))
        if name == "get_destination_details":
            return {"found": True, "name": "Ladakh", "themes": ["mountains"], "days_min": 6, "days_max": 8}
        return await real_call_tool(name, **kwargs)

    gateway_module.call_tool = fake_call_tool
    try:
        gw = TripifiAIGateway(chain=[LiveProvider()])
        response = asyncio.run(gw.chat("Best time to visit Ladakh?", "test-conv"))
    finally:
        gateway_module.call_tool = real_call_tool
    assert response.message == "Ladakh is best visited May to September."
    assert response.intent == "DESTINATION_QUESTION"
    assert response.narrated_live is True
    assert response.is_demo is True  # catalog-grounded sample data
    assert "ollama" in response.sources


def test_ollama_cloud_headers(monkeypatch):
    from app.ai.providers.ollama import OllamaProvider

    monkeypatch.setenv("OLLAMA_API_KEY", "secret")
    monkeypatch.setenv("OLLAMA_CLOUD_MODEL", "gemma4:31b")
    get_settings.cache_clear()
    provider = OllamaProvider()
    assert provider._base() == "https://ollama.com"
    assert provider._model() == "gemma4:31b"
    assert provider._headers()["Authorization"] == "Bearer secret"

    monkeypatch.setenv("OLLAMA_API_KEY", "")
    get_settings.cache_clear()
    assert provider._base() == "http://localhost:11434"
    assert "Authorization" not in provider._headers()
