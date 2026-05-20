"""
AMBAR STUDIO — Database Models
All SQLAlchemy ORM models for the application.
"""
from sqlalchemy import (
    Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class User(Base):
    """User account — can be a regular user or a provider."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    role = Column(String(20), default="user")  # "user" or "provider"
    tokens_balance = Column(Integer, default=3)  # Free tier starts with 3 tokens
    plan = Column(String(50), default="free")  # free, individual, depto, casa, edificio
    city = Column(String(500), default="")
    avatar_url = Column(String(500), default="")
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    projects = relationship("Project", back_populates="user")
    provider_profile = relationship("Provider", back_populates="user", uselist=False)
    payments = relationship("Payment", back_populates="user")
    reviews_given = relationship("Review", back_populates="user")
    chat_messages = relationship("ChatMessage", back_populates="user")


class Provider(Base):
    """Provider/professional profile linked to a user account."""
    __tablename__ = "providers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    business_name = Column(String(255), nullable=False)
    bio = Column(Text, default="")
    categories = Column(JSON, default=list)  # ["textiles", "madera", "metal", ...]
    whatsapp = Column(String(500), default="")
    instagram = Column(String(500), default="")
    contact_email = Column(String(500), default="")
    coverage = Column(String(50), default="local")  # "local" or "national"
    city = Column(String(500), default="")
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    rating = Column(Float, default=0.0)
    review_count = Column(Integer, default=0)
    verified = Column(Boolean, default=False)
    stock_available = Column(Boolean, default=True)
    image_url = Column(String(500), default="")
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="provider_profile")
    quotes = relationship("Quote", back_populates="provider")
    reviews = relationship("Review", back_populates="provider")
    products = relationship("Product", back_populates="provider", cascade="all, delete-orphan")


class Product(Base):
    """A product or material offered by a provider."""
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    provider_id = Column(Integer, ForeignKey("providers.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, default="")
    price = Column(Float, nullable=False)
    unit = Column(String(50), default="unidad") # m2, litro, pieza
    category = Column(String(100), default="")
    image_url = Column(String(500), default="")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    provider = relationship("Provider", back_populates="products")


class Project(Base):
    """A design project created by a user."""
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(255), default="Mi Proyecto")
    original_image = Column(String(500), default="")  # Path to uploaded image
    generated_image = Column(String(500), default="")  # Path to AI-generated image
    style = Column(String(100), default="Minimalista")
    width = Column(Float, default=5.0)  # meters
    length = Column(Float, default=5.0)  # meters
    height = Column(Float, default=3.0)  # meters
    area = Column(Float, default=25.0)  # m² (width * length)
    status = Column(String(30), default="draft")  # draft, uploading, generating, completed, failed
    ai_prompt_used = Column(Text, default="")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="projects")
    materials = relationship("Material", back_populates="project", cascade="all, delete-orphan")
    quotes = relationship("Quote", back_populates="project")


class Material(Base):
    """Materials detected/calculated for a project."""
    __tablename__ = "materials"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    category = Column(String(100), nullable=False)  # "suelos", "iluminacion", "textiles", "pintura", etc.
    name = Column(String(255), nullable=False)
    description = Column(Text, default="")
    estimated_quantity = Column(Float, default=0.0)
    unit = Column(String(50), default="m²")  # m², unidades, litros, metros lineales
    estimated_unit_cost = Column(Float, default=0.0)  # Cost per unit in USD
    estimated_total_cost = Column(Float, default=0.0)
    icon = Column(String(50), default="check_circle")

    # Relationships
    project = relationship("Project", back_populates="materials")


class Quote(Base):
    """Quote request from user to provider."""
    __tablename__ = "quotes"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    provider_id = Column(Integer, ForeignKey("providers.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String(30), default="pending")  # pending, responded, accepted, rejected
    user_message = Column(Text, default="")
    provider_response = Column(Text, default="")
    quoted_amount = Column(Float, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    project = relationship("Project", back_populates="quotes")
    provider = relationship("Provider", back_populates="quotes")


class Payment(Base):
    """Payment record for plan purchases and token top-ups."""
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    stripe_session_id = Column(String(255), default="")
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="usd")
    plan = Column(String(50), default="")  # Plan purchased, or "tokens" for token packs
    tokens_added = Column(Integer, default=0)
    status = Column(String(30), default="pending")  # pending, completed, failed, refunded
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="payments")


class Review(Base):
    """User review of a provider."""
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    provider_id = Column(Integer, ForeignKey("providers.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rating = Column(Integer, nullable=False)  # 1-5
    comment = Column(Text, default="")
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    provider = relationship("Provider", back_populates="reviews")
    user = relationship("User", back_populates="reviews_given")


class ChatMessage(Base):
    """Chat messages between user and AI assistant."""
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    project_id = Column(Integer, nullable=True)  # Optional: context of a project
    role = Column(String(20), nullable=False)  # "user" or "assistant"
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="chat_messages")
