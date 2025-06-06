import requests
import json

user = "Thauanny"
context = [] # O contexto da conversa

print("Digite sua mensagem (digite 'sair' para encerrar ou 'novo' para começar uma nova conversa):")

while True:
    msg = input("Você: ")
    if msg.lower() == 'sair': # Usando 'sair' para encerrar
        break
    if msg.lower() == 'novo': # Usando 'novo' para resetar a conversa
        context = []
        print("--- Nova conversa iniciada! ---")
        # Opcional: Enviar uma mensagem vazia para que o bot mande a saudação novamente
        # Ou, a próxima mensagem do usuário já será a primeira de uma nova sessão.
        # Se você quiser que a saudação apareça logo após digitar 'novo', descomente as linhas abaixo:
        try:
            initial_response = requests.post("http://localhost:8001/chat/", json={"user": user, "message": "", "context": []}, timeout=None).json()
            print("Bot:", initial_response["resposta"])
            context = initial_response["context"]
        except Exception as e:
            print("Erro ao conectar com o backend para iniciar nova conversa:", e)
        continue # Volta para o início do loop para pegar a próxima entrada do usuário

    body = {
        "user": user,
        "message": msg,
        "context": context
    }
    try:
        # Timeout ilimitado na chamada do chat
        resp = requests.post("http://localhost:8001/chat/", json=body, timeout=None)
        resp.raise_for_status() # Levanta um erro para respostas HTTP 4xx/5xx
        data = resp.json()
        
        print("Bot:", data["resposta"])
        context = data["context"]
        
        # AQUI É ONDE USAMOS O NOVO CAMPO 'end_conversation'
        if data.get("end_conversation", False): # Pega o valor, padrão é False se não existir
            print("\nO Aegis concluiu este atendimento. Se precisar de algo mais, digite 'novo' para começar outra conversa, ou 'sair' para fechar.")
            # Não limpamos o 'context' aqui automaticamente, para que o usuário possa rever
            # o histórico. O 'novo' comando fará a limpeza.
            
    except requests.exceptions.ConnectionError:
        print("Erro: Não foi possível conectar ao servidor do chatbot. Verifique se o FastAPI está rodando em http://localhost:8001.")
        break
    except requests.exceptions.RequestException as e:
        print(f"Erro na requisição ao backend: {e}")
        print("Resposta do servidor:", resp.text if 'resp' in locals() else "N/A")
        break
    except Exception as e:
        print("Ocorreu um erro inesperado:", e)
        break

print("Chat encerrado.")