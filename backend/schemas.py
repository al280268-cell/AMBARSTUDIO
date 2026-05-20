"""
AMBAR STUDIO — Pydantic Schemas
Request/response validation models for the API.
"""
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# ──────────────────────────────────────────────
# Auth Schemas
# ──────────────────────────────────────────────
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str = "user"  # "user" or "provider"
    city: str = ""

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserRecover(BaseModel):
    email: EmailStr

class UserReset(BaseModel):
    token: str
    password: str

class UserOut(BaseModel):
    id: int
    email: str
    name: str
    role: str
    tokens_balance: int
    plan: str
    city: str
    avatar_url: str
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ──────────────────────────────────────────────
# Provider Schemas
# ──────────────────────────────────────────────
class ProviderCreate(BaseModel):
    business_name: str
    bio: str = ""
    categories: List[str] = []
    whatsapp: str = ""
    instagram: str = ""
    contact_email: str = ""
    coverage: str = "local"
    city: str = ""
    lat: Optional[float] = None
    lng: Optional[float] = None
    stock_available: bool = True

class ProviderOut(BaseModel):
    id: int
    user_id: int
    business_name: str
    bio: str
    categories: list
    whatsapp: str
    instagram: str
    contact_email: str
    coverage: str
    city: str
    lat: Optional[float]
    lng: Optional[float]
    rating: float
    review_count: int
    verified: bool
    stock_available: bool
    image_url: str
    created_at: datetime
    user_name: Optional[str] = None

    class Config:
        from_attributes = True

class ProductCreate(BaseModel):
    name: str
    description: str = ""
    price: float
    unit: str = "unidad"
    category: str = ""
    image_url: str = ""

class ProductOut(BaseModel):
    id: int
    provider_id: int
    name: str
    description: str
    price: float
    unit: str
    category: str
    image_url: str
    created_at: datetime

    class Config:
        from_attributes = True


# ──────────────────────────────────────────────
# Project Schemas
# ──────────────────────────────────────────────
class ProjectCreate(BaseModel):
    name: str = "Mi Proyecto"
    style: str = "Minimalista"
    width: float = 5.0
    length: float = 5.0
    height: float = 3.0

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    style: Optional[str] = None
    width: Optional[float] = None
    length: Optional[float] = None
    height: Optional[float] = None

class MaterialOut(BaseModel):
    id: int
    category: str
    name: str
    description: str
    estimated_quantity: float
    unit: str
    estimated_unit_cost: float
    estimated_total_cost: float
    icon: str

    class Config:
        from_attributes = True

class ProjectOut(BaseModel):
    id: int
    user_id: int
    name: str
    original_image: str
    generated_image: str
    style: str
    width: float
    length: float
    height: float
    area: float
    status: str
    created_at: datetime
    materials: List[MaterialOut] = []

    class Config:
        from_attributes = True


# ──────────────────────────────────────────────
# AI Schemas
# ──────────────────────────────────────────────
class AIGenerateRequest(BaseModel):
    project_id: int
    style: str = "Minimalista"
    custom_prompt: str = ""

class AIGenerateResponse(BaseModel):
    project_id: int
    status: str
    generated_image: str
    materials: List[MaterialOut]
    estimated_total_cost: float

class AIChatRequest(BaseModel):
    message: str
    project_id: Optional[int] = None

class AIChatResponse(BaseModel):
    reply: str
    project_id: Optional[int] = None


# ──────────────────────────────────────────────
# Quote Schemas
# ──────────────────────────────────────────────
class QuoteCreate(BaseModel):
    project_id: int
    provider_id: int
    message: str = ""

class QuoteRespond(BaseModel):
    provider_response: str
    quoted_amount: Optional[float] = None
    status: str = "responded"  # "responded", "accepted", "rejected"

class QuoteOut(BaseModel):
    id: int
    project_id: int
    provider_id: int
    user_id: int
    status: str
    user_message: str
    provider_response: str
    quoted_amount: Optional[float]
    created_at: datetime
    provider_name: Optional[str] = None
    project_name: Optional[str] = None

    class Config:
        from_attributes = True


# ──────────────────────────────────────────────
# Payment Schemas
# ──────────────────────────────────────────────
class PaymentCreate(BaseModel):
    plan: str  # "individual", "depto", "casa", "edificio", "tokens_100"
    success_url: str = "http://localhost:5173/dashboard?payment=success"
    cancel_url: str = "http://localhost:5173/plans?payment=cancelled"

class PaymentOut(BaseModel):
    id: int
    amount: float
    currency: str
    plan: str
    tokens_added: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class CheckoutResponse(BaseModel):
    checkout_url: str
    session_id: str


# ──────────────────────────────────────────────
# Review Schemas
# ──────────────────────────────────────────────
class ReviewCreate(BaseModel):
    provider_id: int
    rating: int  # 1-5
    comment: str = ""

class ReviewOut(BaseModel):
    id: int
    provider_id: int
    user_id: int
    rating: int
    comment: str
    created_at: datetime
    user_name: Optional[str] = None

    class Config:
        from_attributes = True
