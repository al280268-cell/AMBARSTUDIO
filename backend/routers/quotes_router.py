"""
AMBAR STUDIO — Quotes Router
Quote requests between users and providers.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models
import schemas
from auth import get_current_user

router = APIRouter(prefix="/api/quotes", tags=["Quotes"])


@router.post("", response_model=schemas.QuoteOut)
def create_quote(
    data: schemas.QuoteCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Request a quote from a provider for a project."""
    # Verify project exists and belongs to user
    project = db.query(models.Project).filter(
        models.Project.id == data.project_id,
        models.Project.user_id == current_user.id,
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")

    # Verify provider exists
    provider = db.query(models.Provider).filter(
        models.Provider.id == data.provider_id
    ).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")

    quote = models.Quote(
        project_id=data.project_id,
        provider_id=data.provider_id,
        user_id=current_user.id,
        user_message=data.message,
    )
    db.add(quote)
    db.commit()
    db.refresh(quote)

    result = schemas.QuoteOut.model_validate(quote)
    result.provider_name = provider.business_name
    result.project_name = project.name
    return result


@router.get("", response_model=List[schemas.QuoteOut])
def list_quotes(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List quotes — user sees their requests, provider sees incoming requests."""
    if current_user.role == "provider":
        provider = db.query(models.Provider).filter(
            models.Provider.user_id == current_user.id
        ).first()
        if not provider:
            return []
        quotes = db.query(models.Quote).filter(
            models.Quote.provider_id == provider.id
        ).order_by(models.Quote.created_at.desc()).all()
    else:
        quotes = db.query(models.Quote).filter(
            models.Quote.user_id == current_user.id
        ).order_by(models.Quote.created_at.desc()).all()

    results = []
    for q in quotes:
        out = schemas.QuoteOut.model_validate(q)
        provider = db.query(models.Provider).filter(models.Provider.id == q.provider_id).first()
        project = db.query(models.Project).filter(models.Project.id == q.project_id).first()
        out.provider_name = provider.business_name if provider else ""
        out.project_name = project.name if project else ""
        results.append(out)

    return results


@router.patch("/{quote_id}", response_model=schemas.QuoteOut)
def respond_to_quote(
    quote_id: int,
    data: schemas.QuoteRespond,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Provider responds to a quote request."""
    provider = db.query(models.Provider).filter(
        models.Provider.user_id == current_user.id
    ).first()
    if not provider:
        raise HTTPException(status_code=403, detail="No eres proveedor")

    quote = db.query(models.Quote).filter(
        models.Quote.id == quote_id,
        models.Quote.provider_id == provider.id,
    ).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Cotización no encontrada")

    quote.provider_response = data.provider_response
    quote.quoted_amount = data.quoted_amount
    quote.status = data.status
    db.commit()
    db.refresh(quote)

    result = schemas.QuoteOut.model_validate(quote)
    project = db.query(models.Project).filter(models.Project.id == quote.project_id).first()
    result.provider_name = provider.business_name
    result.project_name = project.name if project else ""
    return result
