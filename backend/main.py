"""
AMBAR STUDIO — Main Application
FastAPI entry point · Aguascalientes, MX
"""
import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from config import settings
from database import init_db
from seed import seed_demo_data
from security import (
    SecurityHeadersMiddleware,
    RateLimitMiddleware,
    RequestLoggingMiddleware,
)
from routers import (
    auth_router,
    projects_router,
    providers_router,
    quotes_router,
    payments_router,
    reviews_router,
    chat_router,
)


# ── Configure Logging ──
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL, logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("ambar")


# Store startup error globally to return it in /api/health for debugging
startup_error = None

@asynccontextmanager
async def lifespan(app):
    global startup_error
    """Application lifecycle: init DB, seed data, log startup."""
    try:
        init_db()
        seed_demo_data()
    except Exception as e:
        import traceback
        startup_error = traceback.format_exc()
        logger.error(f"Startup DB Error: {startup_error}")
        
    logger.info(
        f"══════════════════════════════════════════\n"
        f"   AMBAR STUDIO API v1.0.0\n"
        f"   Mode: {settings.APP_MODE}\n"
        f"   Environment: {'production' if settings.is_production else 'development'}\n"
        f"   Host: {settings.HOST}:{settings.PORT}\n"
        f"   CORS: {', '.join(settings.CORS_ORIGINS)}\n"
        f"══════════════════════════════════════════"
    )
    yield


app = FastAPI(
    title="AMBAR STUDIO API",
    description="Interior Design AI Platform — Aguascalientes, MX",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.is_development else None,
    redoc_url="/redoc" if settings.is_development else None,
)

# ── Security Middleware Stack (order matters: first added = outermost) ──
# 1. Request logging (outermost — logs everything)
app.add_middleware(RequestLoggingMiddleware)
# 2. Security headers (adds headers to all responses)
app.add_middleware(SecurityHeadersMiddleware)
# 3. Rate limiting (blocks abusive IPs before processing)
app.add_middleware(RateLimitMiddleware)
# 4. CORS (controls cross-origin access)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept", "Stripe-Signature"],
)

# ── Static Files ──
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# ── Register All Routers ──
_routers = [
    auth_router,
    projects_router,
    providers_router,
    quotes_router,
    payments_router,
    reviews_router,
    chat_router,
]
for router_module in _routers:
    app.include_router(router_module.router)


# ── Root & Health ──
@app.get("/")
def root():
    return {
        "app": "AMBAR STUDIO",
        "version": "1.0.0",
        "location": "Aguascalientes, MX",
    }


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "mode": settings.APP_MODE,
        "version": "1.0.0",
        "error": startup_error
    }
