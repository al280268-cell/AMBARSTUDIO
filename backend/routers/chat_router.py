"""
AMBAR STUDIO — Chat Router
AI-powered chatbot for user assistance.
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from database import get_db
import models, schemas
from auth import get_current_user
from services.ai_service import chat_response
from security import rate_limiter, sanitize_string, check_suspicious_input

router = APIRouter(prefix="/api/chat", tags=["Chat"])


@router.post("", response_model=schemas.AIChatResponse)
async def send_chat_message(data: schemas.AIChatRequest, request: Request, db: Session = Depends(get_db)):
    """Public chat endpoint — works for everyone, saves history only for logged-in users."""
    # Rate limit by IP
    client_ip = request.headers.get("X-Forwarded-For", "").split(",")[0].strip()
    if not client_ip:
        client_ip = request.client.host if request.client else "unknown"

    if rate_limiter.is_blocked(client_ip):
        raise HTTPException(status_code=429, detail="Demasiados intentos.")

    if not rate_limiter.check_rate(f"{client_ip}:chat", 20, 60):
        raise HTTPException(status_code=429, detail="Demasiados mensajes. Espera un momento.")

    # Validate and sanitize input
    message = sanitize_string(data.message)
    if not message or len(message) > 2000:
        raise HTTPException(status_code=400, detail="Mensaje inválido o demasiado largo (máx. 2000 caracteres)")
    if check_suspicious_input(message):
        raise HTTPException(status_code=400, detail="Mensaje contiene contenido no permitido")

    # Build context
    context = ""

    reply = await chat_response(message, context)

    return schemas.AIChatResponse(reply=reply, project_id=data.project_id)


@router.post("/authenticated", response_model=schemas.AIChatResponse)
async def send_chat_authenticated(data: schemas.AIChatRequest, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Authenticated chat — saves messages to history."""
    # Save user message
    user_msg = models.ChatMessage(user_id=current_user.id, project_id=data.project_id, role="user", content=data.message)
    db.add(user_msg)

    context = ""
    if data.project_id:
        project = db.query(models.Project).filter(models.Project.id == data.project_id).first()
        if project:
            context = f"Proyecto: {project.name}, Estilo: {project.style}, Área: {project.area}m², Estado: {project.status}"

    reply = await chat_response(data.message, context)

    # Save assistant reply
    assistant_msg = models.ChatMessage(user_id=current_user.id, project_id=data.project_id, role="assistant", content=reply)
    db.add(assistant_msg)
    db.commit()

    return schemas.AIChatResponse(reply=reply, project_id=data.project_id)


@router.get("/history")
def get_chat_history(project_id: int = None, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    query = db.query(models.ChatMessage).filter(models.ChatMessage.user_id == current_user.id)
    if project_id:
        query = query.filter(models.ChatMessage.project_id == project_id)
    messages = query.order_by(models.ChatMessage.created_at.asc()).limit(50).all()
    return [{"role": m.role, "content": m.content, "created_at": str(m.created_at)} for m in messages]


@router.get("/admin/sessions")
def get_chat_sessions(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="No autorizado")
    
    user_ids = db.query(models.ChatMessage.user_id).distinct().all()
    sessions = []
    for (uid,) in user_ids:
        u = db.query(models.User).filter(models.User.id == uid).first()
        if u:
            last_msg = db.query(models.ChatMessage).filter(models.ChatMessage.user_id == uid).order_by(models.ChatMessage.created_at.desc()).first()
            sessions.append({
                "user_id": u.id,
                "user_name": u.name,
                "user_email": u.email,
                "last_message": last_msg.content if last_msg else "",
                "updated_at": str(last_msg.created_at) if last_msg else ""
            })
    return sorted(sessions, key=lambda x: x['updated_at'], reverse=True)


@router.get("/admin/history/{user_id}")
def get_admin_chat_history(user_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="No autorizado")
    messages = db.query(models.ChatMessage).filter(models.ChatMessage.user_id == user_id).order_by(models.ChatMessage.created_at.asc()).limit(100).all()
    return [{"role": m.role, "content": m.content, "created_at": str(m.created_at)} for m in messages]


class AdminMessage(schemas.BaseModel):
    user_id: int
    message: str

@router.post("/admin/send")
def admin_send_message(data: AdminMessage, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="No autorizado")
    
    msg = models.ChatMessage(user_id=data.user_id, role="admin", content=data.message)
    db.add(msg)
    db.commit()
    return {"status": "ok"}
