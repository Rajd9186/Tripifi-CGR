"""Shared OpenAI-compatible chat-completions client.

Groq (https://api.groq.com/openai/v1) and NVIDIA NIM
(https://integrate.api.nvidia.com/v1) both speak this protocol, so they
differ only in base URL, key, and default model. Normalized outputs only —
same shape as the Ollama provider so the gateway never branches.
"""

import json
from typing import Any, AsyncIterator

import httpx

from app.ai.providers.base import AIProviderError
from app.core.config import get_settings


class OpenAICompatError(AIProviderError):
    pass


class OpenAICompatProvider:
    name = "openai-compat"
    base_url = ""
    default_model = ""
    timeout = 60

    # -- configuration (overridden by subclasses) -----------------------
    def _api_key(self) -> str:
        return ""

    def _base(self) -> str:
        return self.base_url.rstrip("/")

    def _model(self, override: str | None = None) -> str:
        return override or self.default_model

    def _headers(self) -> dict[str, str]:
        return {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self._api_key()}",
        }

    def _body(
        self,
        messages: list[dict[str, str]],
        stream: bool,
        tools: list[dict[str, Any]] | None = None,
        **kwargs: Any,
    ) -> dict[str, Any]:
        settings = get_settings()
        body: dict[str, Any] = {
            "model": self._model(kwargs.get("model")),
            "messages": messages,
            "stream": stream,
            "temperature": kwargs.get("temperature", settings.ai_temperature),
            "max_tokens": kwargs.get("max_tokens", settings.ai_max_tokens),
        }
        if tools:
            body["tools"] = tools
        return body

    def _raise_for_status(self, status: int, detail: str = "") -> None:
        if status == 401:
            raise OpenAICompatError("AUTH_ERROR", f"{self.name}: invalid API key")
        if status == 404:
            raise OpenAICompatError("MODEL_ERROR", f"{self.name}: model not found {detail}")
        if status == 429:
            raise OpenAICompatError("MODEL_ERROR", f"{self.name}: rate limited")
        if status < 200 or status >= 300:
            raise OpenAICompatError("MODEL_ERROR", f"{self.name}: HTTP {status}")

    @staticmethod
    def _content_of(choice: dict[str, Any]) -> str:
        return ((choice.get("message") or {}).get("content")) or ""

    # -- Protocol --------------------------------------------------------
    async def chat(self, messages: list[dict[str, str]], **kwargs: Any) -> dict[str, Any]:
        if not self._api_key():
            raise OpenAICompatError("AUTH_ERROR", f"{self.name}: API key not configured")
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.post(
                    f"{self._base()}/chat/completions",
                    headers=self._headers(),
                    json=self._body(messages, stream=False, **kwargs),
                )
        except httpx.TimeoutException as e:
            raise OpenAICompatError("TIMEOUT", str(e))
        except httpx.ConnectError as e:
            raise OpenAICompatError("UNAVAILABLE", str(e))
        self._raise_for_status(res.status_code, self._model(kwargs.get("model")))
        try:
            data = res.json()
            content = self._content_of((data.get("choices") or [{}])[0])
        except Exception as e:
            raise OpenAICompatError("BAD_RESPONSE", str(e))
        if not isinstance(content, str):
            raise OpenAICompatError("BAD_RESPONSE", "Non-string content")
        return {"content": content, "model": self._model(kwargs.get("model")), "provider": self.name}

    async def stream(self, messages: list[dict[str, str]], **kwargs: Any) -> AsyncIterator[dict[str, Any]]:
        if not self._api_key():
            raise OpenAICompatError("AUTH_ERROR", f"{self.name}: API key not configured")
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                async with client.stream(
                    "POST",
                    f"{self._base()}/chat/completions",
                    headers=self._headers(),
                    json=self._body(messages, stream=True, **kwargs),
                ) as res:
                    self._raise_for_status(res.status_code, self._model(kwargs.get("model")))
                    async for line in res.aiter_lines():
                        if not line.strip() or not line.startswith("data:"):
                            continue
                        payload = line[5:].strip()
                        if payload == "[DONE]":
                            yield {"done": True, "model": self._model(kwargs.get("model"))}
                            return
                        try:
                            chunk = json.loads(payload)
                        except json.JSONDecodeError:
                            continue
                        delta = (((chunk.get("choices") or [{}])[0].get("delta") or {}).get("content")) or ""
                        if delta:
                            yield {"delta": delta}
        except httpx.TimeoutException as e:
            raise OpenAICompatError("TIMEOUT", str(e))
        except httpx.ConnectError as e:
            raise OpenAICompatError("UNAVAILABLE", str(e))

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
            raise OpenAICompatError("BAD_RESPONSE", f"Model did not return JSON: {e}")
        if not isinstance(parsed, dict):
            raise OpenAICompatError("BAD_RESPONSE", "Model did not return an object")
        return parsed

    async def tool_call(
        self, messages: list[dict[str, str]], tools: list[dict[str, Any]], **kwargs: Any
    ) -> dict[str, Any]:
        if not self._api_key():
            raise OpenAICompatError("AUTH_ERROR", f"{self.name}: API key not configured")
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.post(
                    f"{self._base()}/chat/completions",
                    headers=self._headers(),
                    json=self._body(messages, stream=False, tools=tools, **kwargs),
                )
        except httpx.TimeoutException as e:
            raise OpenAICompatError("TIMEOUT", str(e))
        except httpx.ConnectError as e:
            raise OpenAICompatError("UNAVAILABLE", str(e))
        self._raise_for_status(res.status_code, self._model(kwargs.get("model")))
        try:
            data = res.json()
            message = ((data.get("choices") or [{}])[0].get("message") or {})
        except Exception as e:
            raise OpenAICompatError("BAD_RESPONSE", str(e))
        return {
            "content": message.get("content", "") or "",
            "tool_calls": message.get("tool_calls", []),
            "model": self._model(kwargs.get("model")),
            "provider": self.name,
        }

    async def health(self) -> dict[str, Any]:
        if not self._api_key():
            return {"provider": self.name, "configured": False, "reachable": False}
        try:
            async with httpx.AsyncClient(timeout=8) as client:
                res = await client.get(f"{self._base()}/models", headers=self._headers())
        except (httpx.TimeoutException, httpx.ConnectError):
            return {"provider": self.name, "configured": True, "reachable": False}
        if res.status_code == 401:
            return {"provider": self.name, "configured": True, "reachable": False, "auth": False}
        ok = 200 <= res.status_code < 300
        out: dict[str, Any] = {
            "provider": self.name,
            "configured": True,
            "model": self._model(),
            "reachable": ok,
        }
        if ok:
            try:
                models = [m.get("id", "") for m in res.json().get("data", [])]
                out["model_available"] = any(self._model() in m for m in models)
            except Exception:
                pass
        return out
