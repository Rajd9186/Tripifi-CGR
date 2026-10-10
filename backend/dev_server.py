"""Windows dev entrypoint. Uvicorn creates its event loop before importing the
app, so the loop policy must be set here (database.py also sets it, but that
runs too late under `python -m uvicorn`). Production (Linux) is unaffected.

Usage (from backend/):  venv/Scripts/python dev_server.py [port]
"""

import asyncio
import sys

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

from uvicorn import run  # noqa: E402

if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8001
    run("app.main:app", host="127.0.0.1", port=port)
