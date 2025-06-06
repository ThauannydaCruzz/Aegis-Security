# backend/app/main.py
import os
from dotenv import load_dotenv

# Carrega variáveis de ambiente do arquivo .env ANTES de outros imports da app
load_dotenv() 

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.chat import router as chat_router
from app.routes.security import router as security_router
# from app.routes.dashboard_api import router_dashboard # Se você ainda tem este

app = FastAPI(
    title="Assistente de Cibersegurança Aegis - Backend",
    description="API para o chatbot Aegis e funcionalidades de segurança.",
    version="1.0.0"
)

origins = [
    "http://localhost:8080", # Seu frontend (Vue)
    "http://localhost:3000", # Frontend (React - se usado)
    "http://localhost:5173", # Frontend (Vite/React - como no seu Chatbot.tsx)
    # Adicione outras origens do frontend se necessário
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router)
app.include_router(security_router)
# app.include_router(router_dashboard) # Se você ainda tem este

@app.get("/", tags=["Health Check"])
def health():
    return {"status": "ok", "message": "Bem-vindo à API do Aegis Chatbot!"}