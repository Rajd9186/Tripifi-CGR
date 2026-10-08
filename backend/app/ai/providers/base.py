"""AI provider interface. The gateway depends on this, never on Ollama directly."""

from typing import Any, AsyncIterator, Protocol


class AIProviderError(Exception):
    """Base error for all LLM providers. Gateway catches this, never provider specifics."""

    def __init__(self, kind: str, message: str = ""):
        super().__init__(message or kind)
        self.kind = kind  # UNAVAILABLE|TIMEOUT|MODEL_ERROR|BAD_RESPONSE|AUTH_ERROR


class AIProvider(Protocol):
    name: str

    async def chat(self, messages: list[dict[str, str]], **kwargs: Any) -> dict[str, Any]: ...
    async def stream(self, messages: list[dict[str, str]], **kwargs: Any) -> AsyncIterator[dict[str, Any]]: ...
    async def structured(self, messages: list[dict[str, str]], schema: dict[str, Any], **kwargs: Any) -> dict[str, Any]: ...
    async def tool_call(
        self, messages: list[dict[str, str]], tools: list[dict[str, Any]], **kwargs: Any
    ) -> dict[str, Any]: ...
    async def health(self) -> dict[str, Any]: ...
