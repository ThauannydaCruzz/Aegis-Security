# backend/app/routes/security.py
from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime
from app.utils.whatsapp import send_whatsapp_message

router = APIRouter(prefix="/security", tags=["security"])

INCIDENTES = []

class Incident(BaseModel):
    user: str
    description: str

@router.post("/incident")
def report_incident(incident: Incident):
    print(f"\n--- ROTA: /security/incident ---")
    print(f"  Recebido de {incident.user}. Descrição Bruta da Frontend: '{incident.description}'")

    INCIDENTES.append({
        "user": incident.user,
        "description": incident.description, 
        "timestamp": datetime.now().isoformat()
    })

    raw_description_from_frontend = incident.description
    trigger_phrase_context = "Contexto recente do chat (se houver):" 
    base_alert_reason = raw_description_from_frontend 
    chat_context_snippet = ""

    if trigger_phrase_context in raw_description_from_frontend:
        parts = raw_description_from_frontend.split(trigger_phrase_context, 1)
        base_alert_reason = parts[0].strip() 
        if len(parts) > 1 and parts[1].strip() and parts[1].strip().lower() != "nenhuma interação de chat anterior registrada para este alerta.":
            chat_context_snippet = parts[1].strip()
    
    mensagem_alerta = f"🚨 ALERTA DE EMERGÊNCIA AEGIS 🚨\n\n"
    mensagem_alerta += f"👤 *Usuário:* {incident.user}\n"
    mensagem_alerta += f"❗ *Motivo do Alerta:* {base_alert_reason}\n"
    
    if chat_context_snippet:
        print(f"  Contexto do chat para alerta: '{chat_context_snippet}'")
        mensagem_alerta += f"📝 *Contexto Recente do Chat:*\n_{chat_context_snippet}_\n"
    else:
        print(f"  Nenhum contexto de chat relevante fornecido para o alerta.")
        mensagem_alerta += f"ℹ️ *Observação:* Alerta acionado sem contexto de chat prévio significativo.\n"
        
    mensagem_alerta += f"\nPor favor, verifique a situação e/ou entre em contato com o usuário o mais rápido possível."
    print(f"  Mensagem de alerta final construída para WhatsApp: '{mensagem_alerta}'")

    try:
        send_whatsapp_message(mensagem_alerta)
        return {"status": "incidente registrado, tentativa de alerta via WhatsApp realizada"}
    except Exception as e:
        print(f"  ERRO na rota /security/incident ao tentar enviar WhatsApp: {e}")
        return {"status": "incidente registrado, mas ERRO ao tentar alertar via WhatsApp"}

@router.get("/report")
def report():
    return INCIDENTES