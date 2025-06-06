# app/utils/whatsapp.py
import os
from twilio.rest import Client
from dotenv import load_dotenv
import traceback # Adicione para log de erro

load_dotenv() 

TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN") # Usando Auth Token
TWILIO_WHATSAPP_NUMBER = os.getenv("TWILIO_WHATSAPP_NUMBER")
DEFAULT_WHATSAPP_RECIPIENT = os.getenv("DEFAULT_WHATSAPP_RECIPIENT")

def send_whatsapp_message(message_body: str, to_whatsapp_number: str = None):
    print(f"  DEBUG WHATSAPP: Iniciando send_whatsapp_message.")
    print(f"    TWILIO_ACCOUNT_SID: {'Configurado (termina com ' + TWILIO_ACCOUNT_SID[-4:] + ')' if TWILIO_ACCOUNT_SID else 'NÃO CONFIGURADO'}")
    print(f"    TWILIO_AUTH_TOKEN: {'Configurado' if TWILIO_AUTH_TOKEN else 'NÃO CONFIGURADO'}") # Apenas confirma se existe
    print(f"    TWILIO_WHATSAPP_NUMBER (remetente): {TWILIO_WHATSAPP_NUMBER}")

    if not TWILIO_ACCOUNT_SID or not TWILIO_AUTH_TOKEN or not TWILIO_WHATSAPP_NUMBER:
        print("  ERRO WHATSAPP: Credenciais Twilio (SID, Auth Token ou Número Remetente) não configuradas no .env")
        return

    recipient_number = to_whatsapp_number if to_whatsapp_number else DEFAULT_WHATSAPP_RECIPIENT
    print(f"    DEFAULT_WHATSAPP_RECIPIENT (destinatário padrão): {DEFAULT_WHATSAPP_RECIPIENT}")
    print(f"    Destinatário final para esta mensagem: {recipient_number}")

    if not recipient_number:
        print("  ERRO WHATSAPP: Número do destinatário não especificado e DEFAULT_WHATSAPP_RECIPIENT não configurado.")
        return

    from_number_formatted = f'whatsapp:{TWILIO_WHATSAPP_NUMBER if TWILIO_WHATSAPP_NUMBER.startswith("+") else "+" + TWILIO_WHATSAPP_NUMBER}'
    to_number_formatted = f'whatsapp:{recipient_number if recipient_number.startswith("+") else "+" + recipient_number}'

    try:
        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN) # Inicializa com Account SID e Auth Token

        print(f"  DEBUG WHATSAPP: Tentando enviar de '{from_number_formatted}' para '{to_number_formatted}'")
        print(f"  DEBUG WHATSAPP: Corpo da mensagem (primeiros 100 chars): {message_body[:100]}...")

        message = client.messages.create(
            from_=from_number_formatted,
            body=message_body,
            to=to_number_formatted
        )
        print(f"  SUCESSO WHATSAPP: Mensagem enviada. SID: {message.sid}, Status: {message.status}")
        if message.error_code:
             print(f"    Erro da Twilio após envio: {message.error_code} - {message.error_message}")
    except Exception as e:
        print(f"  FALHA AO ENVIAR WHATSAPP para {to_number_formatted}: {type(e).__name__} - {e}")
        print(traceback.format_exc())