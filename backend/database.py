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

elif "psycopg2" in DATABASE_URL or "postgresql" in DATABASE_URL:
    # PostgreSQL via psycopg2 (Supabase / production)
    # SSL mode is passed via ?sslmode=require in the URL
    engine_kwargs["pool_pre_ping"] = True
    engine_kwargs["pool_recycle"] = 300
    engine_kwargs["pool_size"] = 2
    engine_kwargs["max_overflow"] = 3

elif "pg8000" in DATABASE_URL:
    # Fallback: PostgreSQL via pg8000
    import ssl as _ssl
    ctx = _ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = _ssl.CERT_NONE
    connect_args["ssl_context"] = ctx
    engine_kwargs["connect_args"] = connect_args
    engine_kwargs["pool_pre_ping"] = True

engine = None
SessionLocal = None
try:
    engine = create_engine(DATABASE_URL, **engine_kwargs)
    # Test connection immediately to catch auth errors early
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    logger.info(f"[DB] Engine created and tested OK — {'SQLite' if 'sqlite' in DATABASE_URL else 'PostgreSQL (Supabase)'}")
except Exception as e:
    import traceback
    logger.error(f"[DB] Engine creation failed: {e}")
    logger.error(traceback.format_exc())
    # Store error for /api/health to report
    import os
    os.environ["DB_ERROR"] = str(e)


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
