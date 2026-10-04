"""In-memory session memory. Bounded, trimmed, no secrets stored."""

import time
import uuid

MAX_MESSAGES = 40
KEEP_RECENT = 20

_sessions: dict[str, list[dict]] = {}


def _now() -> float:
    return time.time()


def append_message(session_id: str, role: str, content: str, extra: dict | None = None) -> dict:
    msg = {
        "message_id": f"msg-{uuid.uuid4().hex[:10]}",
        "role": role,  # USER|ASSISTANT|SYSTEM|TOOL
        "content": content,
        "timestamp": _now(),
        **(extra or {}),
    }
    history = _sessions.setdefault(session_id, [])
    history.append(msg)
    if len(history) > MAX_MESSAGES:
        # Trim middle, keep system prompt + recent window.
        head = [m for m in history if m["role"] == "SYSTEM"][:1]
        _sessions[session_id] = head + history[-KEEP_RECENT:]
    return msg


def get_history(session_id: str, limit: int = KEEP_RECENT) -> list[dict]:
    return list(_sessions.get(session_id, [])[-limit:])


def clear_session(session_id: str) -> None:
    _sessions.pop(session_id, None)
