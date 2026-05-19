"""
AMBAR STUDIO — Reviews Router
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas
from auth import get_current_user

router = APIRouter(prefix="/api/reviews", tags=["Reviews"])

@router.post("", response_model=schemas.ReviewOut)
def create_review(data: schemas.ReviewCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    provider = db.query(models.Provider).filter(models.Provider.id == data.provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")
    if data.rating < 1 or data.rating > 5:
        raise HTTPException(status_code=400, detail="Rating debe ser entre 1 y 5")
    review = models.Review(provider_id=data.provider_id, user_id=current_user.id, rating=data.rating, comment=data.comment)
    db.add(review)
    # Update provider rating
    all_reviews = db.query(models.Review).filter(models.Review.provider_id == data.provider_id).all()
    all_reviews_list = list(all_reviews) + [review]
    provider.rating = round(sum(r.rating for r in all_reviews_list) / len(all_reviews_list), 1)
    provider.review_count = len(all_reviews_list)
    db.commit()
    db.refresh(review)
    result = schemas.ReviewOut.model_validate(review)
    result.user_name = current_user.name
    return result

@router.get("/provider/{provider_id}", response_model=List[schemas.ReviewOut])
def get_provider_reviews(provider_id: int, db: Session = Depends(get_db)):
    reviews = db.query(models.Review).filter(models.Review.provider_id == provider_id).order_by(models.Review.created_at.desc()).all()
    results = []
    for r in reviews:
        out = schemas.ReviewOut.model_validate(r)
        user = db.query(models.User).filter(models.User.id == r.user_id).first()
        out.user_name = user.name if user else "Anónimo"
        results.append(out)
    return results
