"""NVIDIA NIM provider (OpenAI-compatible). Hosted inference, no local GPU needed."""

from app.ai.providers.openai_compat import OpenAICompatProvider
from app.core.config import get_settings


class NvidiaProvider(OpenAICompatProvider):
    name = "nvidia"
    base_url = "https://integrate.api.nvidia.com/v1"
    default_model = "meta/llama-3.3-70b-instruct"
    timeout = 90

    def _api_key(self) -> str:
        return get_settings().nvidia_api_key

    def _base(self) -> str:
        return (get_settings().nvidia_base_url or self.base_url).rstrip("/")

    def _model(self, override: str | None = None) -> str:
        return override or get_settings().nvidia_model or self.default_model
