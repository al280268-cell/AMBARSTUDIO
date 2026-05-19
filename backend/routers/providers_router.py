"""
AMBAR STUDIO — Providers Router
Provider profiles, directory listing, search, and secure image uploads.
"""
import os
import uuid
import logging
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
import models
import schemas
from auth import get_current_user, require_admin
from security import sanitize_string, check_suspicious_input
import math

logger = logging.getLogger("ambar.providers")

router = APIRouter(prefix="/api/providers", tags=["Providers"])

# ── Secure Upload Configuration ──
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_IMAGE_TYPES = {".jpg", ".jpeg", ".png", ".webp"}
MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5MB
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}

# Magic bytes for image type verification
IMAGE_SIGNATURES = {
    b"\xff\xd8\xff": "jpeg",
    b"\x89\x50\x4e\x47": "png",
    b"\x52\x49\x46\x46": "webp",
}


def _verify_image_bytes(content: bytes) -> bool:
    """Verify image file by checking magic bytes — prevents disguised malicious files."""
    for signature in IMAGE_SIGNATURES:
        if content[:len(signature)] == signature:
            return True
    return False


async def _secure_save_image(image: UploadFile, subfolder: str = "") -> str:
    """
    Securely save an uploaded image with validation:
    1. File extension check
    2. MIME type check
    3. File size limit
    4. Magic bytes verification
    5. Random filename to prevent path traversal
    """
    if not image or not image.filename:
        raise HTTPException(status_code=400, detail="No se proporcionó una imagen")

    # 1. Extension check
    ext = os.path.splitext(image.filename)[1].lower()
    if ext not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Tipo de archivo no permitido. Usa: {', '.join(ALLOWED_IMAGE_TYPES)}"
        )

    # 2. MIME type check
    if image.content_type and image.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=400, detail="Tipo MIME no permitido")

    # 3. Read and check size
    content = await image.read()
    if len(content) > MAX_IMAGE_SIZE:
        raise HTTPException(status_code=400, detail="La imagen no debe superar 5MB")
    if len(content) < 100:
        raise HTTPException(status_code=400, detail="Archivo demasiado pequeño o vacío")

    # 4. Magic bytes verification
    if not _verify_image_bytes(content):
        logger.warning(f"[SECURITY] Rejected file with invalid magic bytes: {image.filename}")
        raise HTTPException(status_code=400, detail="El archivo no es una imagen válida")

    # 5. Generate safe random filename
    safe_filename = f"{uuid.uuid4().hex}{ext}"
    target_dir = os.path.join(UPLOAD_DIR, subfolder) if subfolder else UPLOAD_DIR
    os.makedirs(target_dir, exist_ok=True)
    filepath = os.path.join(target_dir, safe_filename)

    with open(filepath, "wb") as f:
        f.write(content)

    url_path = f"/uploads/{subfolder}/{safe_filename}" if subfolder else f"/uploads/{safe_filename}"
    logger.info(f"[UPLOAD] Saved image: {url_path} ({len(content)} bytes)")
    return url_path


@router.post("/profile", response_model=schemas.ProviderOut)
def create_or_update_provider(
    data: schemas.ProviderCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create or update provider profile."""
    if current_user.role != "provider":
        current_user.role = "provider"

    provider = db.query(models.Provider).filter(
        models.Provider.user_id == current_user.id
    ).first()

    if provider:
        # Update existing
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(provider, key, value)
    else:
        # Create new
        provider = models.Provider(user_id=current_user.id, **data.model_dump())
        db.add(provider)

    db.commit()
    db.refresh(provider)

    result = schemas.ProviderOut.model_validate(provider)
    result.user_name = current_user.name
    return result


# ── Image Upload Endpoints ──

@router.post("/profile/image")
async def upload_profile_image(
    image: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Upload or update provider profile image (company logo/photo)."""
    provider = db.query(models.Provider).filter(
        models.Provider.user_id == current_user.id
    ).first()
    if not provider:
        raise HTTPException(status_code=400, detail="Crea tu perfil de proveedor primero")

    # Delete old image if it's a local upload
    if provider.image_url and provider.image_url.startswith("/uploads/"):
        old_path = os.path.join(os.path.dirname(UPLOAD_DIR), provider.image_url.lstrip("/"))
        if os.path.exists(old_path):
            try:
                os.remove(old_path)
            except OSError:
                pass

    # Save new image securely
    image_url = await _secure_save_image(image, subfolder="providers")

    provider.image_url = image_url
    db.commit()
    db.refresh(provider)

    return {
        "image_url": provider.image_url,
        "detail": "Imagen de empresa actualizada correctamente"
    }


@router.post("/products/{product_id}/image")
async def upload_product_image(
    product_id: int,
    image: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Upload or update a product catalog image."""
    # Verify ownership: user → provider → product
    provider = db.query(models.Provider).filter(
        models.Provider.user_id == current_user.id
    ).first()
    if not provider:
        raise HTTPException(status_code=403, detail="No eres proveedor")

    product = db.query(models.Product).filter(
        models.Product.id == product_id,
        models.Product.provider_id == provider.id,
    ).first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado o no te pertenece")

    # Delete old image if local
    if product.image_url and product.image_url.startswith("/uploads/"):
        old_path = os.path.join(os.path.dirname(UPLOAD_DIR), product.image_url.lstrip("/"))
        if os.path.exists(old_path):
            try:
                os.remove(old_path)
            except OSError:
                pass

    # Save new image securely
    image_url = await _secure_save_image(image, subfolder="products")

    product.image_url = image_url
    db.commit()
    db.refresh(product)

    return {
        "product_id": product.id,
        "image_url": product.image_url,
        "detail": "Imagen de producto actualizada"
    }


@router.delete("/products/{product_id}")
def delete_product(
    product_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a product from the catalog. Only the owner can delete."""
    provider = db.query(models.Provider).filter(
        models.Provider.user_id == current_user.id
    ).first()
    if not provider:
        raise HTTPException(status_code=403, detail="No eres proveedor")

    product = db.query(models.Product).filter(
        models.Product.id == product_id,
        models.Product.provider_id == provider.id,
    ).first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    # Clean up image file
    if product.image_url and product.image_url.startswith("/uploads/"):
        old_path = os.path.join(os.path.dirname(UPLOAD_DIR), product.image_url.lstrip("/"))
        if os.path.exists(old_path):
            try:
                os.remove(old_path)
            except OSError:
                pass

    db.delete(product)
    db.commit()
    return {"detail": "Producto eliminado"}


# ── Directory Listing ──

@router.get("", response_model=List[schemas.ProviderOut])
def list_providers(
    category: Optional[str] = Query(None, description="Filter by category", max_length=50),
    city: Optional[str] = Query(None, description="Filter by city", max_length=100),
    search: Optional[str] = Query(None, description="Search by name", max_length=100),
    db: Session = Depends(get_db),
):
    """List all verified providers with optional filters."""
    query = db.query(models.Provider).filter(models.Provider.verified == True)

    if category:
        cat = sanitize_string(category)
        if check_suspicious_input(cat):
            raise HTTPException(status_code=400, detail="Parámetro inválido")
        query = query.filter(models.Provider.categories.contains(cat))
    if city:
        c = sanitize_string(city)
        if check_suspicious_input(c):
            raise HTTPException(status_code=400, detail="Parámetro inválido")
        query = query.filter(models.Provider.city.ilike(f"%{c}%"))
    if search:
        s = sanitize_string(search)
        if check_suspicious_input(s):
            raise HTTPException(status_code=400, detail="Parámetro inválido")
        query = query.filter(models.Provider.business_name.ilike(f"%{s}%"))

    providers = query.order_by(models.Provider.rating.desc()).all()

    results = []
    for p in providers:
        out = schemas.ProviderOut.model_validate(p)
        user = db.query(models.User).filter(models.User.id == p.user_id).first()
        out.user_name = user.name if user else ""
        results.append(out)

    return results


@router.get("/all", response_model=List[schemas.ProviderOut])
def list_all_providers(
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """List ALL providers (including unverified) — admin only."""
    providers = db.query(models.Provider).order_by(models.Provider.rating.desc()).all()
    results = []
    for p in providers:
        out = schemas.ProviderOut.model_validate(p)
        user = db.query(models.User).filter(models.User.id == p.user_id).first()
        out.user_name = user.name if user else ""
        results.append(out)
    return results


@router.get("/nearby", response_model=List[schemas.ProviderOut])
def get_nearby_providers(
    lat: float = Query(..., description="User latitude"),
    lng: float = Query(..., description="User longitude"),
    radius_km: float = Query(50, description="Search radius in km"),
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """Find providers near a location using Haversine formula."""
    providers = db.query(models.Provider).filter(
        models.Provider.lat.isnot(None),
        models.Provider.lng.isnot(None),
    ).all()

    def haversine(lat1, lon1, lat2, lon2):
        R = 6371  # Earth radius in km
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = (math.sin(dlat/2)**2 +
             math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
             math.sin(dlon/2)**2)
        return R * 2 * math.asin(math.sqrt(a))

    nearby = []
    for p in providers:
        dist = haversine(lat, lng, p.lat, p.lng)
        if dist <= radius_km:
            out = schemas.ProviderOut.model_validate(p)
            user = db.query(models.User).filter(models.User.id == p.user_id).first()
            out.user_name = user.name if user else ""
            nearby.append(out)

    return nearby


@router.get("/{provider_id}", response_model=schemas.ProviderOut)
def get_provider(provider_id: int, db: Session = Depends(get_db)):
    """Get a single provider by ID."""
    provider = db.query(models.Provider).filter(models.Provider.id == provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")

    result = schemas.ProviderOut.model_validate(provider)
    user = db.query(models.User).filter(models.User.id == provider.user_id).first()
    result.user_name = user.name if user else ""
    return result


@router.post("/products", response_model=schemas.ProductOut)
def create_product(
    data: schemas.ProductCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Add a new product for the authenticated provider."""
    provider = db.query(models.Provider).filter(models.Provider.user_id == current_user.id).first()
    if not provider:
        raise HTTPException(status_code=400, detail="Debes crear un perfil de proveedor primero")
    
    product = models.Product(provider_id=provider.id, **data.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.get("/products/all", response_model=List[schemas.ProductOut])
def list_products(
    category: Optional[str] = Query(None, description="Filter by category"),
    db: Session = Depends(get_db)
):
    """List all products, optionally filtered by category."""
    query = db.query(models.Product)
    if category:
        cat = sanitize_string(category)
        if check_suspicious_input(cat):
            raise HTTPException(status_code=400, detail="Parámetro inválido")
        query = query.filter(models.Product.category.ilike(f"%{cat}%"))
    return query.all()


@router.get("/{provider_id}/products", response_model=List[schemas.ProductOut])
def get_provider_products(provider_id: int, db: Session = Depends(get_db)):
    """Get all products for a specific provider."""
    return db.query(models.Product).filter(models.Product.provider_id == provider_id).all()
