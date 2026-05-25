"""
Vercel serverless entry point for AMBAR STUDIO backend.
Includes full error reporting for debugging deployment issues.
"""
import sys
import os
import traceback

# Make the backend package importable
_backend_dir = os.path.join(os.path.dirname(__file__), "..", "backend")
_backend_dir = os.path.abspath(_backend_dir)
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

# Set Vercel environment flags
os.environ.setdefault("VERCEL", "1")
os.environ.setdefault("AMBAR_ENV", "production")
os.environ.setdefault("APP_MODE", "production")

# Try to import the FastAPI app, catch any error and expose it via a fallback app
_import_error = None
app = None

try:
    from main import app  # noqa
except Exception as e:
    _import_error = traceback.format_exc()
    # Create a minimal fallback app that reports the error
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import JSONResponse

    app = FastAPI(title="AMBAR STUDIO - Error Mode")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/api/health")
    def health_error():
        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "error": _import_error,
                "python": sys.version,
                "path": sys.path[:3],
                "backend_dir": _backend_dir,
                "backend_exists": os.path.isdir(_backend_dir),
            },
        )

    @app.get("/api/{path:path}")
    @app.post("/api/{path:path}")
    def catch_all(path: str):
        return JSONResponse(
            status_code=503,
            content={"detail": "Backend inicializando. Revisa /api/health para detalles.", "error": str(_import_error)[:500] if _import_error else None},
        )

# Vercel ASGI handler
handler = app
