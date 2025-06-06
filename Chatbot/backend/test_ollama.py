# test_ollama.py
import requests
import json

OLLAMA_URL = "http://localhost:11434/api/chat"

payload = {
    "model": "phi3",
    "messages": [
        {"role": "user", "content": "o que é um vírus de computador?"}
    ],
    "stream": False
}

print("--- Tentando se comunicar com o Ollama em", OLLAMA_URL)
print("--- Payload:", json.dumps(payload, indent=2))

try:
    # Usando um timeout super longo para ter certeza de que não é lentidão
    response = requests.post(OLLAMA_URL, json=payload, timeout=120)

    # Lança um erro se o status não for 2xx (sucesso)
    response.raise_for_status()

    print("\n\n--- SUCESSO! OLLAMA RESPONDEU! ---")
    print("A comunicação entre Python e Ollama está funcionando.")
    print("\nResposta Recebida:")
    print(response.json())

except requests.exceptions.Timeout:
    print("\n\n--- FALHA: TIMEOUT ---")
    print("O Ollama recebeu a pergunta, mas demorou mais de 2 minutos para responder.")
    print("Isso indica que o Ollama está extremamente lento ou travado.")

except requests.exceptions.ConnectionError:
    print("\n\n--- FALHA: ERRO DE CONEXÃO ---")
    print("Não foi possível estabelecer uma conexão com", OLLAMA_URL)
    print("CAUSAS PROVÁVEIS:")
    print("1. O servidor 'ollama serve' não está rodando.")
    print("2. Um FIREWALL ou ANTIVÍRUS no seu Windows está bloqueando a conexão do Python.")

except requests.exceptions.RequestException as e:
    print("\n\n--- FALHA: ERRO GERAL NA REQUISIÇÃO ---")
    print("Ocorreu um erro inesperado:", e)