"""
AMBAR STUDIO — Auth Router
Registration, login, and profile endpoints.
Hardened with rate limiting, role protection, and password policies.
"""
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from auth import hash_password, verify_password, create_access_token, get_current_user
from security import (
    rate_limiter,
    validate_registration_role,
    validate_password_strength,
    sanitize_string,
    check_suspicious_input,
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=schemas.TokenResponse)
def register(data: schemas.UserRegister, request: Request, db: Session = Depends(get_db)):
    """Register a new user account."""
    client_ip = request.headers.get("X-Forwarded-For", "").split(",")[0].strip()
    if not client_ip:
        client_ip = request.client.host if request.client else "unknown"

    # Block if IP is banned
    if rate_limiter.is_blocked(client_ip):
        raise HTTPException(status_code=429, detail="Demasiados intentos. Intenta más tarde.")

    # Validate role — NEVER allow 'admin' registration
    role = validate_registration_role(data.role)

    # Password strength policy
    validate_password_strength(data.password)

    # Sanitize and validate name
    name = sanitize_string(data.name)
    if not name:
        raise HTTPException(status_code=400, detail="El nombre es obligatorio")
    if len(name) > 100:
        raise HTTPException(status_code=400, detail="El nombre es demasiado largo")
    if check_suspicious_input(name):
        raise HTTPException(status_code=400, detail="Nombre contiene caracteres no válidos")

    # Sanitize city
    city = sanitize_string(data.city)
    if check_suspicious_input(city):
        raise HTTPException(status_code=400, detail="Ciudad contiene caracteres no válidos")

    # Validate email length
    if len(data.email) > 255:
        raise HTTPException(status_code=400, detail="El correo es demasiado largo")

    # Check if email already exists — use generic message to prevent enumeration
    existing = db.query(models.User).filter(models.User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="No se pudo crear la cuenta. Verifica tus datos.")

    user = models.User(
        email=data.email,
        password_hash=hash_password(data.password),
        name=name,
        role=role,
        city=city,
        tokens_balance=3,  # Free tokens on signup
        plan="free",
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id), "role": user.role})
    return schemas.TokenResponse(
        access_token=token,
        user=schemas.UserOut.model_validate(user),
    )


@router.post("/login", response_model=schemas.TokenResponse)
def login(data: schemas.UserLogin, request: Request, db: Session = Depends(get_db)):
    """Login with email and password."""
    client_ip = request.headers.get("X-Forwarded-For", "").split(",")[0].strip()
    if not client_ip:
        client_ip = request.client.host if request.client else "unknown"

    # Block if IP is banned
    if rate_limiter.is_blocked(client_ip):
        raise HTTPException(status_code=429, detail="Demasiados intentos. Intenta más tarde.")

    user = db.query(models.User).filter(models.User.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        # Record failure for brute-force protection
        failures = rate_limiter.record_login_failure(client_ip)
        # Generic message — don't reveal if email exists
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")

    # Successful login — clear failure counter
    rate_limiter.clear_login_failures(client_ip)

    token = create_access_token({"sub": str(user.id), "role": user.role})
    return schemas.TokenResponse(
        access_token=token,
        user=schemas.UserOut.model_validate(user),
    )


@router.get("/me", response_model=schemas.UserOut)
def get_me(current_user: models.User = Depends(get_current_user)):
    """Get current authenticated user profile."""
    return schemas.UserOut.model_validate(current_user)


@router.patch("/me", response_model=schemas.UserOut)
def update_me(
    name: str = None,
    city: str = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update current user profile."""
    if name:
        name = sanitize_string(name)
        if len(name) > 100:
            raise HTTPException(status_code=400, detail="Nombre demasiado largo")
        if check_suspicious_input(name):
            raise HTTPException(status_code=400, detail="Nombre contiene caracteres no válidos")
        current_user.name = name
    if city:
        city = sanitize_string(city)
        if check_suspicious_input(city):
            raise HTTPException(status_code=400, detail="Ciudad contiene caracteres no válidos")
        current_user.city = city
    db.commit()
    db.refresh(current_user)
    return schemas.UserOut.model_validate(current_user)


@router.get("/users")
def get_all_users(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Admin endpoint to list all users."""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="No autorizado")
    users = db.query(models.User).order_by(models.User.id.desc()).all()
    return [{"id": u.id, "name": u.name, "email": u.email, "role": u.role, "city": u.city, "plan": u.plan, "tokens_balance": u.tokens_balance} for u in users]
