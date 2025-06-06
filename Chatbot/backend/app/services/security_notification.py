# backend/app/services/security_notification.py
import os
from twilio.rest import Client

# Carrega as credenciais do ambiente
API_KEY_SID = os.getenv("TWILIO_API_KEY_SID")
API_KEY_SECRET = os.getenv("TWILIO_API_KEY_SECRET")
ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID") # Account SID principal
TWILIO_WHATSAPP_SENDER = os.getenv("TWILIO_WHATSAPP_NUMBER")

def send_security_whatsapp(body, to_number_raw): # to_number_raw é o número sem 'whatsapp:'
    if not all([API_KEY_SID, API_KEY_SECRET, ACCOUNT_SID, TWILIO_WHATSAPP_SENDER]):
        print("Erro: Credenciais Twilio (API Key, Secret, Account SID) ou número do remetente não configurados para security_notification.")
        return

    try:
        # Inicializa o cliente com API Key SID, API Key Secret e Account SID
        client = Client(API_KEY_SID, API_KEY_SECRET, ACCOUNT_SID)

        client.messages.create(
            from_=f'whatsapp:{TWILIO_WHATSAPP_SENDER}',
            to=f'whatsapp:{to_number_raw}', # Adiciona o prefixo aqui
            body=body
        )
        print(f"Notificação de segurança (via API Key) enviada para whatsapp:{to_number_raw}")
    except Exception as e:
        print(f"Erro ao enviar notificação de segurança (via API Key): {e}")


def notify_security_incident(user_phone_raw, incident_summary): # user_phone_raw é o número sem 'whatsapp:'
    body = f"🚨 Alerta de Segurança Aegis 🚨\nResumo do incidente:\n{incident_summary}"
    send_security_whatsapp(body, user_phone_raw)