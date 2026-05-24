"""
AMBAR STUDIO — Security Module
Rate limiting, security headers, input sanitization, and brute-force protection.
"""
import time
import re
import logging
from collections import defaultdict
from typing import Dict, Tuple
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger("ambar.security")


# ──────────────────────────────────────────────
# Rate Limiter (in-memory, per-IP)
# ──────────────────────────────────────────────
class RateLimiter:
    """
    Token-bucket rate limiter per IP address.
    Tracks request counts within sliding time windows.
    """

    def __init__(self):
        # {ip: [(timestamp, count), ...]}
        self._requests: Dict[str, list] = defaultdict(list)
        # {ip: (block_until_timestamp, reason)}
        self._blocked: Dict[str, Tuple[float, str]] = {}
        # {ip: consecutive_failed_logins}
        self._login_failures: Dict[str, int] = defaultdict(int)

    def _cleanup(self, ip: str, window: int):
        """Remove expired entries from tracking."""
        now = time.time()
        self._requests[ip] = [
            (ts, c) for ts, c in self._requests[ip] if now - ts < window
        ]

    def is_blocked(self, ip: str) -> bool:
        """Check if IP is temporarily blocked."""
        if ip in self._blocked:
            block_until, reason = self._blocked[ip]
            if time.time() < block_until:
                return True
            else:
                del self._blocked[ip]
                self._login_failures.pop(ip, None)
        return False

    def block_ip(self, ip: str, duration_seconds: int, reason: str = ""):
        """Temporarily block an IP."""
        self._blocked[ip] = (time.time() + duration_seconds, reason)
        logger.warning(f"[SECURITY] IP blocked: {ip} for {duration_seconds}s — {reason}")

    def check_rate(self, ip: str, limit: int, window: int) -> bool:
        """
        Check if request is within rate limit.
        Returns True if allowed, False if rate exceeded.
        """
        now = time.time()
        self._cleanup(ip, window)
        request_count = sum(c for _, c in self._requests[ip])

        if request_count >= limit:
            return False

        self._requests[ip].append((now, 1))
        return True

    def record_login_failure(self, ip: str) -> int:
        """Record a failed login attempt. Returns total failures."""
        self._login_failures[ip] = self._login_failures.get(ip, 0) + 1
        failures = self._login_failures[ip]

        # Progressive blocking
        if failures >= 10:
            self.block_ip(ip, 3600, "10+ failed logins — blocked 1 hour")
        elif failures >= 5:
            self.block_ip(ip, 300, "5+ failed logins — blocked 5 minutes")
        elif failures >= 3:
            self.block_ip(ip, 30, "3+ failed logins — blocked 30 seconds")

        return failures

    def clear_login_failures(self, ip: str):
        """Clear login failure counter on successful login."""
        self._login_failures.pop(ip, None)


# Global rate limiter instance
rate_limiter = RateLimiter()


# Rate limit configurations per endpoint pattern
RATE_LIMITS = {
    "/api/auth/login": (3, 60),       # 3 attempts per minute
    "/api/auth/register": (2, 60),    # 2 registrations per minute
    "/api/chat": (10, 60),            # 10 messages per minute
    "/api/projects/generate": (2, 60),  # 2 AI generations per minute
    "/api/payments": (5, 60),         # 5 payment operations per minute
}

# General rate limit for all API endpoints
GENERAL_RATE_LIMIT = (120, 60)  # 120 requests per minute per IP


# ──────────────────────────────────────────────
# Security Headers Middleware
# ──────────────────────────────────────────────
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to all responses."""

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)

        # Prevent clickjacking
        response.headers["X-Frame-Options"] = "DENY"
        # Prevent MIME type sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"
        # XSS protection (legacy browsers)
        response.headers["X-XSS-Protection"] = "1; mode=block"
        # Referrer policy
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        # Permissions policy
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=(self)"
        # HSTS (only in production)
        if request.url.scheme == "https":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        # Content Security Policy
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "img-src 'self' https: data:; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com; "
            "script-src 'self' https://js.stripe.com; "
            "connect-src 'self' https://api.stripe.com; "
            "frame-src 'self' https://js.stripe.com https://hooks.stripe.com"
        )

        return response


# ──────────────────────────────────────────────
# Rate Limiting Middleware
# ──────────────────────────────────────────────
class RateLimitMiddleware(BaseHTTPMiddleware):
    """Apply rate limiting per IP and per endpoint."""

    async def dispatch(self, request: Request, call_next):
        # Get real client IP (behind proxy)
        client_ip = request.headers.get("X-Forwarded-For", "").split(",")[0].strip()
        if not client_ip:
            client_ip = request.client.host if request.client else "unknown"

        # Check if IP is blocked
        if rate_limiter.is_blocked(client_ip):
            logger.warning(f"[SECURITY] Blocked request from {client_ip}: {request.url.path}")
            return JSONResponse(
                status_code=429,
                content={"detail": "Demasiados intentos. Intenta más tarde."}
            )

        path = request.url.path

        # Apply endpoint-specific rate limits
        for pattern, (limit, window) in RATE_LIMITS.items():
            if path.startswith(pattern):
                if not rate_limiter.check_rate(f"{client_ip}:{pattern}", limit, window):
                    logger.warning(f"[RATE LIMIT] {client_ip} exceeded {limit}/{window}s on {pattern}")
                    return JSONResponse(
                        status_code=429,
                        content={"detail": "Demasiadas solicitudes. Espera un momento."}
                    )
                break

        # Apply general rate limit for API endpoints
        if path.startswith("/api/"):
            limit, window = GENERAL_RATE_LIMIT
            if not rate_limiter.check_rate(f"{client_ip}:general", limit, window):
                logger.warning(f"[RATE LIMIT] {client_ip} exceeded general limit")
                return JSONResponse(
                    status_code=429,
                    content={"detail": "Demasiadas solicitudes. Espera un momento."}
                )

        response = await call_next(request)
        return response


# ──────────────────────────────────────────────
# Input Sanitization
# ──────────────────────────────────────────────
_SQL_INJECTION_PATTERNS = re.compile(
    r"(\b(union|select|insert|update|delete|drop|alter|create|exec|execute|xp_)\b"
    r"|(--)|(;)|(\/\*)|(\*\/))",
    re.IGNORECASE,
)

_XSS_PATTERNS = re.compile(
    r"(<script|javascript:|on\w+\s*=|<iframe|<object|<embed|<form|<svg\s+on)",
    re.IGNORECASE,
)


def sanitize_string(value: str) -> str:
    """Remove potentially dangerous characters from user input."""
    if not value:
        return value
    # Strip HTML tags
    value = re.sub(r"<[^>]*>", "", value)
    # Strip null bytes
    value = value.replace("\x00", "")
    return value.strip()


def check_suspicious_input(value: str) -> bool:
    """
    Check if input contains SQL injection or XSS patterns.
    Returns True if suspicious.
    """
    if not value:
        return False
    if _SQL_INJECTION_PATTERNS.search(value):
        return True
    if _XSS_PATTERNS.search(value):
        return True
    return False


# ──────────────────────────────────────────────
# Role Validation
# ──────────────────────────────────────────────
ALLOWED_REGISTRATION_ROLES = {"user", "provider"}


def validate_registration_role(role: str) -> str:
    """Ensure users cannot register as admin."""
    if role not in ALLOWED_REGISTRATION_ROLES:
        raise HTTPException(
            status_code=400,
            detail="Rol no válido. Usa 'user' o 'provider'."
        )
    return role


# ──────────────────────────────────────────────
# Password Policy
# ──────────────────────────────────────────────
def validate_password_strength(password: str) -> None:
    """Enforce minimum password requirements (must match UI messaging)."""
    if len(password) < 6:
        raise HTTPException(
            status_code=400,
            detail="La contraseña debe tener al menos 6 caracteres."
        )


# ──────────────────────────────────────────────
# Request Logging
# ──────────────────────────────────────────────
class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Log all API requests for audit trail."""

    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        client_ip = request.headers.get("X-Forwarded-For", "").split(",")[0].strip()
        if not client_ip:
            client_ip = request.client.host if request.client else "unknown"

        response = await call_next(request)

        duration = time.time() - start_time
        path = request.url.path

        # Only log API requests (skip static files)
        if path.startswith("/api/"):
            log_level = logging.WARNING if response.status_code >= 400 else logging.INFO
            logger.log(
                log_level,
                f"[{request.method}] {path} → {response.status_code} "
                f"({duration:.3f}s) IP={client_ip}"
            )

        return response
