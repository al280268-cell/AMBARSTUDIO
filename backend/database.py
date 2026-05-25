"""
AMBAR STUDIO — Database Configuration
SQLAlchemy engine and session management.
Uses SQLite for local development, PostgreSQL (Supabase) for production.
"""
from sqlalchemy import create_engine, event, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import logging

from config import settings

logger = logging.getLogger("ambar.db")

DATABASE_URL = settings.DATABASE_URL

# ── Build engine based on DB type ──
connect_args = {}
engine_kwargs = {
    "echo": settings.DEBUG,
}

if "sqlite" in DATABASE_URL:
    # SQLite: local development only
    connect_args["check_same_thread"] = False
    engine_kwargs["connect_args"] = connect_args

elif "pg8000" in DATABASE_URL:
    # PostgreSQL via pg8000 (Supabase / Vercel)
    import ssl
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    connect_args["ssl_context"] = ctx
    engine_kwargs["connect_args"] = connect_args
    # Supabase transaction pooler doesn't support prepared statements
    engine_kwargs["pool_pre_ping"] = True
    engine_kwargs["pool_recycle"] = 300
    engine_kwargs["pool_size"] = 2
    engine_kwargs["max_overflow"] = 3

engine = None
SessionLocal = None
try:
    engine = create_engine(DATABASE_URL, **engine_kwargs)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    logger.info(f"[DB] Engine created — {'SQLite' if 'sqlite' in DATABASE_URL else 'PostgreSQL (Supabase)'}")
except Exception as e:
    logger.error(f"[DB] Engine creation failed: {e}")

Base = declarative_base()

def get_db():
    """Dependency injection for database sessions."""
    if SessionLocal is None:
        raise Exception("Database engine failed to initialize")
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all tables. Called on app startup."""
    if engine is not None:
        Base.metadata.create_all(bind=engine)
        logger.info("[DB] Tables created/verified OK")
