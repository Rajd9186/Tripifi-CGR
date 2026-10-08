"""Ollama provider. Local-first runtime; normalized outputs only."""

import json
from typing import Any, AsyncIterator

import httpx

from app.ai.providers.base import AIProviderError
from app.core.config import get_settings


class OllamaError(AIProviderError):
    pass


class OllamaProvider:
    name = "ollama"

    def _base(self) -> str:
        return get_settings().ollama_base_url.rstrip("/")

    def _model(self, override: str | None = None) -> str:
        return override or get_settings().ollama_model

    async def chat(self, messages: list[dict[str, str]], **kwargs: Any) -> dict[str, Any]:
        settings = get_settings()
        try:
            async with httpx.AsyncClient(timeout=settings.ollama_timeout) as client:
                res = await client.post(
                    f"{self._base()}/api/chat",
                    json={
                        "model": self._model(kwargs.get("model")),
                        "messages": messages,
                        "stream": False,
                        "options": {
                            "temperature": kwargs.get("temperature", settings.ai_temperature),
                            "num_predict": kwargs.get("max_tokens", settings.ai_max_tokens),
                        },
                    },
                )
        except httpx.TimeoutException as e:
            raise OllamaError("TIMEOUT", str(e))
        except httpx.ConnectError as e:
            raise OllamaError("UNAVAILABLE", str(e))
        if res.status_code == 404:
            raise OllamaError("MODEL_ERROR", "Model not found on Ollama server")
        if res.status_code < 200 or res.status_code >= 300:
            raise OllamaError("MODEL_ERROR", f"Ollama HTTP {res.status_code}")
        try:
            data = res.json()
            content = (data.get("message") or {}).get("content", "")
        except Exception as e:
            raise OllamaError("BAD_RESPONSE", str(e))
        if not isinstance(content, str):
            raise OllamaError("BAD_RESPONSE", "Non-string content")
        return {"content": content, "model": self._model(kwargs.get("model")), "provider": "ollama"}

    async def stream(self, messages: list[dict[str, str]], **kwargs: Any) -> AsyncIterator[dict[str, Any]]:
        settings = get_settings()
        try:
            async with httpx.AsyncClient(timeout=settings.ollama_timeout) as client:
                async with client.stream(
                    "POST",
                    f"{self._base()}/api/chat",
                    json={
                        "model": self._model(kwargs.get("model")),
                        "messages": messages,
                        "stream": True,
                        "options": {
                            "temperature": kwargs.get("temperature", settings.ai_temperature),
                            "num_predict": kwargs.get("max_tokens", settings.ai_max_tokens),
                        },
                    },
                ) as res:
                    if res.status_code == 404:
                        raise OllamaError("MODEL_ERROR", "Model not found on Ollama server")
                    if res.status_code != 200:
                        raise OllamaError("MODEL_ERROR", f"Ollama HTTP {res.status_code}")
                    async for line in res.aiter_lines():
                        if not line.strip():
                            continue
                        try:
                            chunk = json.loads(line)
                        except json.JSONDecodeError:
                            continue
                        delta = (chunk.get("message") or {}).get("content", "")
                        if delta:
                            yield {"delta": delta}
                        if chunk.get("done"):
                            yield {"done": True, "model": self._model(kwargs.get("model"))}
        except httpx.TimeoutException as e:
            raise OllamaError("TIMEOUT", str(e))
        except httpx.ConnectError as e:
            raise OllamaError("UNAVAILABLE", str(e))

    async def structured(self, messages: list[dict[str, str]], schema: dict[str, Any], **kwargs: Any) -> dict[str, Any]:
        guided = list(messages) + [
            {
                "role": "system",
                "content": (
                    "Respond with ONLY a JSON object matching this schema, no prose, "
                    f"no markdown fences: {json.dumps(schema)}"
                ),
            }
        ]
        result = await self.chat(guided, **kwargs)
        text = result["content"].strip()
        if text.startswith("```"):
            text = text.strip("`").split("\n", 1)[-1].rsplit("```", 1)[0]
        try:
            parsed = json.loads(text)
        except json.JSONDecodeError as e:
            raise OllamaError("BAD_RESPONSE", f"Model did not return JSON: {e}")
        if not isinstance(parsed, dict):
            raise OllamaError("BAD_RESPONSE", "Model did not return an object")
        return parsed

    async def tool_call(
        self, messages: list[dict[str, str]], tools: list[dict[str, Any]], **kwargs: Any
    ) -> dict[str, Any]:
        settings = get_settings()
        try:
            async with httpx.AsyncClient(timeout=settings.ollama_timeout) as client:
                res = await client.post(
                    f"{self._base()}/api/chat",
                    json={
                        "model": self._model(kwargs.get("model")),
                        "messages": messages,
                        "stream": False,
                        "tools": tools,
                        "options": {"temperature": kwargs.get("temperature", settings.ai_temperature)},
                    },
                )
        except httpx.TimeoutException as e:
            raise OllamaError("TIMEOUT", str(e))
        except httpx.ConnectError as e:
            raise OllamaError("UNAVAILABLE", str(e))
        if res.status_code == 404:
            raise OllamaError("MODEL_ERROR", "Model not found on Ollama server")
        if res.status_code < 200 or res.status_code >= 300:
            raise OllamaError("MODEL_ERROR", f"Ollama HTTP {res.status_code}")
        try:
            data = res.json()
            message = data.get("message", {})
        except Exception as e:
            raise OllamaError("BAD_RESPONSE", str(e))
        return {
            "content": message.get("content", ""),
            "tool_calls": message.get("tool_calls", []),
            "model": self._model(kwargs.get("model")),
            "provider": "ollama",
        }

    async def health(self) -> dict[str, Any]:
        settings = get_settings()
        try:
            async with httpx.AsyncClient(timeout=5) as client:
                res = await client.get(f"{self._base()}/api/tags")
        except (httpx.TimeoutException, httpx.ConnectError):
            return {"provider": "ollama", "configured": True, "model": settings.ollama_model, "reachable": False}
        if res.status_code < 200 or res.status_code >= 300:
            return {"provider": "ollama", "configured": True, "model": settings.ollama_model, "reachable": False}
        try:
            models = [m.get("name", "") for m in res.json().get("models", [])]
        except Exception:
            models = []
        return {
            "provider": "ollama",
            "configured": True,
            "model": settings.ollama_model,
            "reachable": True,
            "model_available": any(settings.ollama_model in m for m in models),
        }
