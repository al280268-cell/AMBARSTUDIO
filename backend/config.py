"""
AMBAR STUDIO — Configuración Centralizada
Carga las variables de entorno según el entorno activo (development / production).
Valida que las variables críticas estén presentes antes de iniciar.
"""
import os
from typing import Optional, List
from dotenv import load_dotenv

# ──────────────────────────────────────────────
# Determinar entorno activo
# ──────────────────────────────────────────────
ENV = os.getenv("AMBAR_ENV", "development")  # "development" | "production"

if ENV == "production":
    load_dotenv(".env.production", override=True)
else:
    load_dotenv(".env.development", override=True)

# Siempre cargar .env como fallback
load_dotenv(".env", override=False)


# ──────────────────────────────────────────────
# Variables de configuración tipadas
# ──────────────────────────────────────────────
class Settings:
    """Configuración centralizada de la aplicación."""

    # App
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-key-change-me")
    APP_MODE: str = os.getenv("APP_MODE", "demo")
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")

    # Database
    DATABASE_URL: str = "sqlite:////tmp/ambar_studio.db" if os.getenv("VERCEL") else os.getenv("DATABASE_URL", "sqlite:///./ambar_studio.db")

    # AI
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")

    # Stripe
    STRIPE_SECRET_KEY: str = os.getenv("STRIPE_SECRET_KEY", "")
    STRIPE_PUBLISHABLE_KEY: str = os.getenv("STRIPE_PUBLISHABLE_KEY", "")
    STRIPE_WEBHOOK_SECRET: str = os.getenv("STRIPE_WEBHOOK_SECRET", "")

    # Google Maps
    GOOGLE_MAPS_API_KEY: str = os.getenv("GOOGLE_MAPS_API_KEY", "")

    # CORS
    CORS_ORIGINS: List[str] = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"
        ).split(",")
    ]

    # Server
    HOST: str = os.getenv("HOST", "127.0.0.1")
    PORT: int = int(os.getenv("PORT", "8000"))
    RELOAD: bool = os.getenv("RELOAD", "false").lower() == "true"

    @property
    def is_production(self) -> bool:
        return ENV == "production"

    @property
    def is_development(self) -> bool:
        return ENV == "development"

    @property
    def is_demo_mode(self) -> bool:
        return self.APP_MODE == "demo"

    def validate(self) -> None:
        """Validate critical settings for production."""
        if self.is_production:
            errors: List[str] = []
            if self.SECRET_KEY == "dev-secret-key-change-me":
                errors.append("SECRET_KEY no debe ser el valor por defecto en producción")
            if "sqlite" in self.DATABASE_URL:
                errors.append("DATABASE_URL no debe usar SQLite en producción (usa PostgreSQL)")
            if errors:
                print(f"⚠️  [CONFIG] Advertencias de producción:")
                for err in errors:
                    print(f"   → {err}")


# Singleton global
settings = Settings()
settings.validate()

print(f"[CONFIG] Entorno: {ENV} | Modo: {settings.APP_MODE} | Debug: {settings.DEBUG}")
