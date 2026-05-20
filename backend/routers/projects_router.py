"""
AMBAR STUDIO — Projects Router
Create, list, and manage design projects.
"""
import os
import uuid
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
import models
import schemas
from auth import get_current_user
from services.ai_service import generate_design

router = APIRouter(prefix="/api/projects", tags=["Projects"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
try:
    os.makedirs(UPLOAD_DIR, exist_ok=True)
except OSError:
    UPLOAD_DIR = "/tmp/uploads"
    os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("", response_model=schemas.ProjectOut)
async def create_project(
    name: str = Form("Mi Proyecto"),
    style: str = Form("Minimalista"),
    width: float = Form(5.0),
    length: float = Form(5.0),
    height: float = Form(3.0),
    image: Optional[UploadFile] = File(None),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new design project with optional image upload."""
    area = width * length
    
    from services.stripe_service import PLANS
    user_plan = current_user.plan or "free"
    
    max_area = 15 # Default for free plan
    if user_plan in PLANS and PLANS[user_plan].get("max_area"):
        max_area = PLANS[user_plan]["max_area"]
        
    if area > max_area:
        raise HTTPException(
            status_code=403, 
            detail=f"Tu plan actual ({user_plan}) solo permite diseñar espacios de hasta {max_area}m². El área solicitada es {area}m²."
        )

    # Save uploaded image
    original_image = ""
    if image:
        # Validate file type
        allowed_types = {".jpg", ".jpeg", ".png", ".webp", ".heic"}
        ext = os.path.splitext(image.filename)[1].lower() if image.filename else ""
        if ext not in allowed_types:
            raise HTTPException(status_code=400, detail=f"Tipo de archivo no permitido. Usa: {', '.join(allowed_types)}")

        # Validate file size (max 10MB)
        content = await image.read()
        if len(content) > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="La imagen no debe superar 10MB")

        filename = f"{uuid.uuid4().hex}{ext}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        with open(filepath, "wb") as f:
            f.write(content)
        original_image = f"/uploads/{filename}"

    project = models.Project(
        user_id=current_user.id,
        name=name,
        style=style,
        width=width,
        length=length,
        height=height,
        area=area,
        original_image=original_image,
        status="draft" if not original_image else "uploaded",
    )
    db.add(project)
    db.commit()
    db.refresh(project)

    return schemas.ProjectOut.model_validate(project)


@router.get("", response_model=List[schemas.ProjectOut])
def list_projects(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all projects for the current user."""
    projects = (
        db.query(models.Project)
        .filter(models.Project.user_id == current_user.id, models.Project.is_active == True)
        .order_by(models.Project.created_at.desc())
        .all()
    )
    return [schemas.ProjectOut.model_validate(p) for p in projects]


@router.get("/{project_id}", response_model=schemas.ProjectOut)
def get_project(
    project_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a single project by ID."""
    project = (
        db.query(models.Project)
        .filter(models.Project.id == project_id, models.Project.user_id == current_user.id, models.Project.is_active == True)
        .first()
    )
    if not project:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    return schemas.ProjectOut.model_validate(project)


@router.post("/{project_id}/generate", response_model=schemas.AIGenerateResponse)
async def generate_project_design(
    project_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate AI design for a project. Consumes 1 token."""
    project = (
        db.query(models.Project)
        .filter(models.Project.id == project_id, models.Project.user_id == current_user.id, models.Project.is_active == True)
        .first()
    )
    if not project:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")

    # Check tokens — Render HD costs 15 tokens
    RENDER_COST = 15
    if current_user.tokens_balance < RENDER_COST:
        raise HTTPException(
            status_code=402,
            detail=f"No tienes tokens suficientes. Necesitas {RENDER_COST} tokens para generar un render. Adquiere un plan o créditos adicionales."
        )

    # Update status
    project.status = "generating"
    db.commit()

    try:
        # Call AI service
        result = await generate_design(
            style=project.style,
            width=project.width,
            length=project.length,
            height=project.height,
            original_image_path=project.original_image,
            custom_prompt=project.name,
        )

        # Update project with results
        project.generated_image = result["generated_image"]
        project.ai_prompt_used = result["ai_prompt_used"]
        project.status = "completed"

        # Clear old materials and add new ones
        db.query(models.Material).filter(models.Material.project_id == project.id).delete()
        for mat_data in result["materials"]:
            material = models.Material(project_id=project.id, **mat_data)
            db.add(material)

        # Deduct tokens (Render HD = 15 tokens)
        current_user.tokens_balance -= RENDER_COST
        db.commit()
        db.refresh(project)

        # Build response
        materials_out = [
            schemas.MaterialOut.model_validate(m)
            for m in db.query(models.Material).filter(models.Material.project_id == project.id).all()
        ]

        return schemas.AIGenerateResponse(
            project_id=project.id,
            status="completed",
            generated_image=project.generated_image,
            materials=materials_out,
            estimated_total_cost=result["estimated_total_cost"],
        )

    except Exception as e:
        import logging
        logging.getLogger("ambar.ai").error(f"AI generation failed for project {project_id}: {e}")
        project.status = "failed"
        db.commit()
        raise HTTPException(status_code=500, detail="Error en generación. Intenta de nuevo más tarde.")


@router.delete("/{project_id}")
def delete_project(
    project_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a project."""
    project = (
        db.query(models.Project)
        .filter(models.Project.id == project_id, models.Project.user_id == current_user.id)
        .first()
    )
    if not project:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")

    project.is_active = False
    db.commit()
    return {"detail": "Proyecto eliminado"}
