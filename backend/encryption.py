import os
from cryptography.fernet import Fernet
import logging

logger = logging.getLogger("ambar.encryption")

# Obtain or generate an encryption key. In production, this MUST come from an environment variable!
FERNET_KEY = os.getenv("FERNET_KEY")

if not FERNET_KEY:
    logger.warning("No FERNET_KEY found in environment. Generating a temporary one for this session.")
    FERNET_KEY = Fernet.generate_key().decode("utf-8")

# Initialize Fernet cipher suite
try:
    cipher_suite = Fernet(FERNET_KEY.encode("utf-8"))
except Exception as e:
    logger.error(f"Failed to initialize Fernet cipher suite: {e}")
    # Fallback key generation if invalid key provided
    FERNET_KEY = Fernet.generate_key().decode("utf-8")
    cipher_suite = Fernet(FERNET_KEY.encode("utf-8"))

def encrypt_data(data: str) -> str:
    """Encrypts a string. If None or empty, returns it as is."""
    if not data:
        return data
    try:
        encrypted = cipher_suite.encrypt(data.encode("utf-8"))
        return encrypted.decode("utf-8")
    except Exception as e:
        logger.error(f"Encryption failed: {e}")
        return data

def decrypt_data(encrypted_data: str) -> str:
    """Decrypts a string. If it fails (e.g. not encrypted), returns original."""
    if not encrypted_data:
        return encrypted_data
    try:
        decrypted = cipher_suite.decrypt(encrypted_data.encode("utf-8"))
        return decrypted.decode("utf-8")
    except Exception:
        # If decryption fails, it might be legacy unencrypted data
        return encrypted_data
