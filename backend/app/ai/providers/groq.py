"""Groq provider (OpenAI-compatible). Fast hosted inference, no local GPU needed."""

from app.ai.providers.openai_compat import OpenAICompatProvider
from app.core.config import get_settings


class GroqProvider(OpenAICompatProvider):
    name = "groq"
    base_url = "https://api.groq.com/openai/v1"
    default_model = "llama-3.3-70b-versatile"
    timeout = 60

    def _api_key(self) -> str:
        return get_settings().groq_api_key

    def _base(self) -> str:
        return (get_settings().groq_base_url or self.base_url).rstrip("/")

    def _model(self, override: str | None = None) -> str:
        return override or get_settings().groq_model or self.default_model
