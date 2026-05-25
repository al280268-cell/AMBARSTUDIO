"""
Vercel serverless entry point for AMBAR STUDIO backend.
Adds the backend directory to sys.path and exports the FastAPI app.
"""
import sys
import os

# Make the backend package importable from this location
_backend_dir = os.path.join(os.path.dirname(__file__), "..", "backend")
if _backend_dir not in sys.path:
    sys.path.insert(0, os.path.abspath(_backend_dir))

# Set Vercel environment flag so config uses /tmp for SQLite
os.environ.setdefault("VERCEL", "1")
os.environ.setdefault("AMBAR_ENV", "production")
os.environ.setdefault("APP_MODE", "production")

# Import the FastAPI app — Vercel will call this as an ASGI handler
from main import app  # noqa: E402  (import after sys.path manipulation)

# Vercel expects the handler to be named 'app' or 'handler'
handler = app
