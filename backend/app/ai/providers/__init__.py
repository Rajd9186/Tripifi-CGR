"""AI provider selection. Env-driven, key-aware, safe fallback to local Ollama.

AI_PROVIDER picks the preference (groq|nvidia|ollama). A provider is only
selected when it can actually serve: hosted providers need their API key,
Ollama needs nothing (it may still fail at call time, which the gateway
turns into deterministic fallbacks — never an exception to the client).
"""

from app.ai.providers.base import AIProvider
from app.ai.providers.groq import GroqProvider
from app.ai.providers.nvidia import NvidiaProvider
from app.ai.providers.ollama import OllamaProvider
from app.core.config import get_settings

__all__ = [
    "AIProvider",
    "GroqProvider",
    "NvidiaProvider",
    "OllamaProvider",
    "get_ai_provider",
    "available_providers",
]


def available_providers() -> list[dict[str, object]]:
    settings = get_settings()
    return [
        {"name": "groq", "configured": bool(settings.groq_api_key)},
        {"name": "nvidia", "configured": bool(settings.nvidia_api_key)},
        {"name": "ollama", "configured": True},
    ]


def get_ai_provider(preferred: str | None = None) -> AIProvider:
    settings = get_settings()
    want = (preferred or settings.ai_provider or "groq").lower()

    candidates: list[AIProvider] = []
    if want == "groq" and settings.groq_api_key:
        candidates.append(GroqProvider())
    elif want == "nvidia" and settings.nvidia_api_key:
        candidates.append(NvidiaProvider())
    elif want == "ollama":
        candidates.append(OllamaProvider())

    # Fallback chain: any keyed hosted provider, then local Ollama.
    if settings.groq_api_key and not any(p.name == "groq" for p in candidates):
        candidates.append(GroqProvider())
    if settings.nvidia_api_key and not any(p.name == "nvidia" for p in candidates):
        candidates.append(NvidiaProvider())
    candidates.append(OllamaProvider())
    return candidates[0]
