"""
AMBAR STUDIO — Payments Router
Stripe checkout, payment history, and plan management.
"""
import logging
from fastapi import APIRouter, Depends, HTTPException, Request, Header
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas
from auth import get_current_user
from config import settings
from services.stripe_service import (
    create_checkout_session,
    get_plan_info,
    verify_checkout_session,
    is_stripe_ready,
    PLANS,
)

logger = logging.getLogger("ambar.payments")
router = APIRouter(prefix="/api/payments", tags=["Payments"])

@router.get("/plans")
def get_plans():
    return {
        k: {
            "name": v["name"],
            "price": v["price_display"],
            "tokens": v["tokens"],
            "description": v["description"],
            "entregable": v.get("entregable", ""),
        }
        for k, v in PLANS.items()
    }

@router.get("/config")
def get_payment_config():
    return {
        "publishable_key": settings.STRIPE_PUBLISHABLE_KEY if is_stripe_ready() else "",
        "stripe_enabled": is_stripe_ready(),
        "currency": "mxn",
    }

@router.post("/checkout", response_model=schemas.CheckoutResponse)
async def create_checkout(
    data: schemas.PaymentCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    plan_info = get_plan_info(data.plan)
    if not plan_info:
        raise HTTPException(status_code=400, detail="Plan no válido.")

    try:
        result = await create_checkout_session(
            data.plan, current_user.id, data.success_url, data.cancel_url
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Error al procesar el pago.")

    payment = models.Payment(
        user_id=current_user.id,
        stripe_session_id=result["session_id"],
        amount=plan_info["price_display"],
        currency="mxn",
        plan=data.plan,
        tokens_added=plan_info["tokens"],
        status="pending",
    )
    db.add(payment)
    db.commit()
    return schemas.CheckoutResponse(**result)

@router.post("/confirm/{session_id}")
def confirm_payment(
    session_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    payment = db.query(models.Payment).filter(
        models.Payment.stripe_session_id == session_id,
        models.Payment.user_id == current_user.id,
    ).with_for_update().first()
    
    if not payment:
        raise HTTPException(status_code=404, detail="Pago no encontrado")
    if payment.status == "completed":
        return {"detail": "Pago ya procesado", "status": "completed", "tokens_added": payment.tokens_added, "new_balance": current_user.tokens_balance, "plan": current_user.plan}

    is_paid, metadata = verify_checkout_session(session_id)
    if not is_paid:
        payment.status = "failed"
        db.commit()
        raise HTTPException(status_code=402, detail="El pago no fue completado")

    payment.status = "completed"
    plan_info = get_plan_info(payment.plan)
    if plan_info:
        current_user.tokens_balance += plan_info["tokens"]
        if payment.plan != "tokens_100":
            current_user.plan = payment.plan

    db.commit()
    return {"detail": "Pago confirmado", "status": "completed", "tokens_added": plan_info["tokens"] if plan_info else 0, "new_balance": current_user.tokens_balance, "plan": current_user.plan}

@router.get("/history", response_model=List[schemas.PaymentOut])
def payment_history(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    payments = db.query(models.Payment).filter(models.Payment.user_id == current_user.id).order_by(models.Payment.created_at.desc()).all()
    return [schemas.PaymentOut.model_validate(p) for p in payments]

@router.post("/webhook")
async def stripe_webhook(request: Request, stripe_signature: str = Header(None), db: Session = Depends(get_db)):
    if not is_stripe_ready():
        return {"status": "ignored", "reason": "stripe disabled"}
    import stripe
    payload = await request.body()
    try:
        event = stripe.Webhook.construct_event(payload, stripe_signature, settings.STRIPE_WEBHOOK_SECRET)
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        raise HTTPException(status_code=400, detail="Invalid webhook payload")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        payment = db.query(models.Payment).filter(
            models.Payment.stripe_session_id == session["id"]
        ).with_for_update().first()
        if payment and payment.status == "pending":
            payment.status = "completed"
            user = db.query(models.User).filter(models.User.id == payment.user_id).first()
            if user:
                user.tokens_balance += payment.tokens_added
                if payment.plan != "tokens_100":
                    user.plan = payment.plan
            db.commit()
            logger.info(f"Webhook: Pago completado para session {session['id']}")
    return {"status": "success"}
