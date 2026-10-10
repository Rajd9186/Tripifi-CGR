"""AI provider selection. Env-driven, key-aware, real fallback chain.

Chain order: Ollama (cloud when OLLAMA_API_KEY is set, else local) → Groq →
NVIDIA → local Ollama last resort. The gateway tries each in order and serves
from the first that answers; hosted providers are only chained when keyed.
"""

from app.ai.providers.base import AIProvider, AIProviderError
from app.ai.providers.groq import GroqProvider
from app.ai.providers.nvidia import NvidiaProvider
from app.ai.providers.ollama import OllamaProvider
from app.core.config import get_settings

__all__ = [
    "AIProvider",
    "AIProviderError",
    "GroqProvider",
    "NvidiaProvider",
    "OllamaProvider",
    "get_ai_provider",
    "get_provider_chain",
    "available_providers",
]


def available_providers() -> list[dict[str, object]]:
    settings = get_settings()
    return [
        {"name": "ollama", "mode": "cloud" if settings.ollama_api_key else "local", "configured": True},
        {"name": "groq", "configured": bool(settings.groq_api_key)},
        {"name": "nvidia", "configured": bool(settings.nvidia_api_key)},
    ]


def get_provider_chain(preferred: str | None = None) -> list[AIProvider]:
    """Ordered, de-duplicated providers to try. Ollama always included."""
    settings = get_settings()
    want = (preferred or settings.ai_provider or "ollama").lower()

    by_name: dict[str, AIProvider] = {"ollama": OllamaProvider()}
    if settings.groq_api_key:
        by_name["groq"] = GroqProvider()
    if settings.nvidia_api_key:
        by_name["nvidia"] = NvidiaProvider()

    order = [want, "ollama", "groq", "nvidia"]
    chain: list[AIProvider] = []
    for name in order:
        provider = by_name.get(name)
        if provider is not None and all(p.name != provider.name for p in chain):
            chain.append(provider)
    return chain


def get_ai_provider(preferred: str | None = None) -> AIProvider:
    return get_provider_chain(preferred)[0]
