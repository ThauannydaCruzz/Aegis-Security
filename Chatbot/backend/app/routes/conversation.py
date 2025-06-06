from fastapi import APIRouter, Request
from app.services.security_notification import notify_security_incident

router = APIRouter()

@router.post("/conversation")
async def handle_conversation(request: Request):
    data = await request.json()
    user = ... # obtenha info do usuário autenticado
    message = data.get("message", "")
    # Lógica de detecção de incidente (pode ser IA, regex, etc)
    if "ataque" in message or "phishing" in message or "vazamento" in message:
        notify_security_incident(user.email, user.phone, f"Mensagem suspeita: {message}")
    # continue fluxo normal do chatbot