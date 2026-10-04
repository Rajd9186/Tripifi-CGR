from fastapi import Request
from fastapi.responses import JSONResponse


def error_response(request: Request, code: str, message: str, status: int = 400):
    request_id = getattr(request.state, "request_id", "req-unknown")
    return JSONResponse(
        status_code=status,
        content={"error": {"code": code, "message": message, "request_id": request_id}},
    )
