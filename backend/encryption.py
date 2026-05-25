import os
from pathlib import Path
from cryptography.fernet import Fernet
import logging

logger = logging.getLogger("ambar.encryption")

# ── Stable Fernet key management ──────────────────────────────────────────────
# Priority: env var → .env file → generate once and save to .env
# This ensures the key NEVER changes between server restarts.

_ENV_FILE = Path(__file__).parent / ".env"
_TMP_KEY_FILE = Path("/tmp/.ambar_fernet_key")  # Vercel: /tmp is writable

def _load_or_create_fernet_key() -> str:
    # 1. Check process environment first (set in Vercel dashboard)
    key = os.environ.get("FERNET_KEY", "").strip()
    if key:
        return key

    # 2. Try reading from /tmp (Vercel warm container reuse)
    if _TMP_KEY_FILE.exists():
        key = _TMP_KEY_FILE.read_text(encoding="utf-8").strip()
        if key:
            os.environ["FERNET_KEY"] = key
            return key

    # 3. Try reading from local .env file (local dev)
    if _ENV_FILE.exists():
        for line in _ENV_FILE.read_text(encoding="utf-8").splitlines():
            if line.startswith("FERNET_KEY="):
                key = line.split("=", 1)[1].strip()
                if key:
                    os.environ["FERNET_KEY"] = key
                    return key

    # 4. Generate a new key and try to persist it
    key = Fernet.generate_key().decode("utf-8")
    os.environ["FERNET_KEY"] = key
    logger.info("Generated new FERNET_KEY")

    # Try to save to /tmp first (works on Vercel), then local .env
    try:
        _TMP_KEY_FILE.write_text(key, encoding="utf-8")
    except OSError:
        pass

    try:
        existing = _ENV_FILE.read_text(encoding="utf-8") if _ENV_FILE.exists() else ""
        with open(_ENV_FILE, "a", encoding="utf-8") as f:
            if existing and not existing.endswith("\n"):
                f.write("\n")
            f.write(f"FERNET_KEY={key}\n")
    except OSError:
        pass  # Read-only filesystem (Vercel) — key is in os.environ for this session

    return key



FERNET_KEY = _load_or_create_fernet_key()

try:
    cipher_suite = Fernet(FERNET_KEY.encode("utf-8"))
except Exception as e:
    logger.error(f"Failed to initialize Fernet cipher suite: {e}")
    FERNET_KEY = Fernet.generate_key().decode("utf-8")
    cipher_suite = Fernet(FERNET_KEY.encode("utf-8"))


def encrypt_data(data: str) -> str:
    """Encrypts a string. Returns empty string for empty/None input."""
    if not data:
        return data or ""
    try:
        return cipher_suite.encrypt(data.encode("utf-8")).decode("utf-8")
    except Exception as e:
        logger.error(f"Encryption failed: {e}")
        return data


def decrypt_data(encrypted_data: str) -> str:
    """Decrypts a string. Falls back to returning original if not encrypted (legacy data)."""
    if not encrypted_data:
        return encrypted_data or ""
    try:
        return cipher_suite.decrypt(encrypted_data.encode("utf-8")).decode("utf-8")
    except Exception:
        # Legacy plaintext data — return as-is
        return encrypted_data
