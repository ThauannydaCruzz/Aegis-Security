# backend/test_twilio.py
import os
from twilio.rest import Client
from dotenv import load_dotenv
import traceback
from datetime import datetime

# Carrega as variáveis de ambiente do arquivo .env
load_dotenv() 

# Carrega as credenciais e números do .env
account_sid = os.getenv("TWILIO_ACCOUNT_SID")
auth_token = os.getenv("TWILIO_AUTH_TOKEN") # Importante: Este deve ser o Auth Token principal
from_whatsapp_number = os.getenv("TWILIO_WHATSAPP_NUMBER")
to_whatsapp_number = os.getenv("DEFAULT_WHATSAPP_RECIPIENT") 

print("--- Iniciando Teste de Envio Twilio WhatsApp ---")
print(f"ACCOUNT_SID (do .env): {account_sid}")
print(f"AUTH_TOKEN (do .env): {'Presente' if auth_token else 'AUSENTE NO .ENV'}")
print(f"FROM_WHATSAPP (do .env): {from_whatsapp_number}")
print(f"TO_WHATSAPP (do .env): {to_whatsapp_number}")

if not all([account_sid, auth_token, from_whatsapp_number, to_whatsapp_number]):
    print("\nERRO: Uma ou mais variáveis de ambiente da Twilio não foram encontradas no arquivo .env.")
    print("Verifique se TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER e DEFAULT_WHATSAPP_RECIPIENT estão definidas.")
else:
    try:
        client = Client(account_sid, auth_token) # Usa Account SID e Auth Token

        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        message_body = f"Teste de Alerta Aegis (via Auth Token) às {timestamp}!"
        
        # Garante que os números estão no formato correto para a API
        from_formatted = f'whatsapp:{from_whatsapp_number if from_whatsapp_number.startswith("+") else "+" + from_whatsapp_number}'
        to_formatted = f'whatsapp:{to_whatsapp_number if to_whatsapp_number.startswith("+") else "+" + to_whatsapp_number}'

        print(f"\nTentando enviar de: {from_formatted} para: {to_formatted}")
        print(f"Corpo da mensagem: {message_body}")
        
        message = client.messages.create(
                            from_=from_formatted,
                            body=message_body,
                            to=to_formatted
                        )
        print(f"\nSUCESSO! Mensagem enviada.")
        print(f"  SID da Mensagem: {message.sid}")
        print(f"  Status da Mensagem: {message.status}")
        if message.error_code:
            print(f"  Erro da Twilio (após envio): {message.error_code} - {message.error_message}")
    except Exception as e:
        print(f"\nFALHA AO ENVIAR MENSAGEM via Twilio:")
        print(f"  Tipo do Erro: {type(e).__name__}")
        print(f"  Mensagem do Erro: {e}")
        print("  Traceback Completo:")
        print(traceback.format_exc())
        print("\nPossíveis causas:")
        print("- TWILIO_AUTH_TOKEN incorreto no .env.")
        print("- Número remetente (TWILIO_WHATSAPP_NUMBER) não é o número do sandbox ou não está habilitado para WhatsApp.")
        print("- Número destinatário (DEFAULT_WHATSAPP_RECIPIENT) não deu 'join' no sandbox da Twilio (se aplicável).")
        print("- Problemas de conectividade ou com a conta Twilio (verifique o console da Twilio para mais detalhes).")

print("--- Teste de Envio Twilio WhatsApp Concluído ---")