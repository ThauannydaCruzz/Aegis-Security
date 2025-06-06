# Aegis Security Chatbot

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white) ![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi&logoColor=white) ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white) ![Twilio](https://img.shields.io/badge/Twilio-F22F46?style=for-the-badge&logo=twilio&logoColor=white)

**Aegis** é um assistente de cibersegurança avançado, projetado para oferecer suporte e orientação a usuários no Brasil. Utilizando um modelo de linguagem local (LLM) através do Ollama, o Aegis é capaz de responder a perguntas, diagnosticar incidentes de segurança através de um fluxo de conversa guiado e notificar uma equipe de suporte em casos críticos.

*(Aqui você pode adicionar um GIF demonstrando o chatbot em ação)*
`![Demonstração do Aegis](link_para_seu_gif.gif)`

---

## ✨ Funcionalidades Principais

* **🧠 Assistente de Conhecimento:** Responde a perguntas gerais sobre termos e práticas de cibersegurança (ex: "o que é malware?", "como criar uma senha forte?").
* **🕵️‍♂️ Analista de Incidentes:** Ao receber um relato de incidente (ex: "meu site foi invadido"), inicia um fluxo de diagnóstico com perguntas sequenciais para avaliar a gravidade do problema.
* **💡 Soluções Direcionadas:** Fornece orientações e os primeiros passos a serem tomados com base no diagnóstico do incidente. Para os casos mais comuns, utiliza respostas de alta qualidade já programadas para garantir precisão e velocidade.
* **📲 Notificação de Emergência via WhatsApp:** Permite que o usuário acione um botão de emergência que notifica instantaneamente a equipe de suporte via API da Twilio.
* **📊 Relatório de Atendimento:** Ao finalizar um atendimento (através do botão "Finalizar"), um relatório estruturado e resumido da interação é enviado para a equipe de suporte via WhatsApp.
* **📜 Registro de Conversas:** Salva transcrições de todas as conversas em arquivos de texto para fins de auditoria e análise futura.

---

## 🛠️ Tecnologias Utilizadas

O projeto é dividido em duas partes principais: o backend e o frontend.

### Backend
* **Python:** Linguagem principal para toda a lógica da aplicação.
* **FastAPI:** Framework web para construir a API REST que o frontend consome.
* **Uvicorn:** Servidor ASGI que executa a aplicação FastAPI.
* **Ollama & Phi-3:** O Ollama serve para rodar o modelo de linguagem `phi-3` localmente, funcionando como o "cérebro" para respostas não programadas.
* **Twilio API:** Serviço utilizado para enviar as notificações e relatórios para a equipe de suporte via WhatsApp.
* **Pydantic:** Usado pelo FastAPI para validação e serialização de dados.
* **Dotenv:** Para gerenciamento seguro de variáveis de ambiente (chaves de API, segredos).

### Frontend
* **React:** Biblioteca principal para a construção da interface de usuário.
* **TypeScript:** Superset do JavaScript que adiciona tipagem estática ao código.
* **Shadcn/UI:** Coleção de componentes de UI reusáveis para construir a interface do chat.
* **Tailwind CSS:** Framework de CSS para estilização rápida e responsiva.
* **Vite:** Ferramenta de build para um desenvolvimento frontend extremamente rápido.

---

## 🚀 Como Rodar o Projeto

Siga os passos abaixo para configurar e executar o projeto em seu ambiente local.

### Pré-requisitos
* [**Git**](https://git-scm.com/downloads)
* [**Python**](https://www.python.org/downloads/) (versão 3.9 ou superior)
* [**Node.js**](https://nodejs.org/en) (versão 18 ou superior)
* [**Ollama**](https://ollama.com/) instalado e com o modelo `phi-3` baixado (`ollama pull phi3`).

### 1. Clonar o Repositório
```bash
git clone [https://github.com/ThauannydaCruzz/Aegis-Security.git](https://github.com/ThauannydaCruzz/Aegis-Security.git)
cd Aegis-Security
```

### 2. Configurar o Backend
1.  **Navegue até a pasta do backend:**
    ```bash
    cd backend
    ```
2.  **Crie e ative um ambiente virtual:**
    ```bash
    # Criar o ambiente
    python -m venv venv

    # Ativar no Windows (PowerShell)
    .\venv\Scripts\Activate
    ```
3.  **Crie o arquivo `requirements.txt`:** Se você já instalou as bibliotecas (`fastapi`, `uvicorn`, `requests`, `twilio`, `python-dotenv`), gere o arquivo de dependências:
    ```bash
    pip freeze > requirements.txt
    ```
4.  **Instale as dependências:** (Se outra pessoa for rodar o projeto, ela usará este comando)
    ```bash
    pip install -r requirements.txt
    ```
5.  **Configure as variáveis de ambiente:**
    * Crie uma cópia do arquivo `.env.example` (se houver um) ou crie um novo arquivo chamado `.env`.
    * Preencha o arquivo `.env` com suas chaves da Twilio e outras configurações:
        ```ini
        TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
        TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
        TWILIO_WHATSAPP_NUMBER=+14155238886
        DEFAULT_WHATSAPP_RECIPIENT=+55SEUNUMERO
        OLLAMA_URL=http://localhost:11434/api/chat
        OLLAMA_MODEL=phi3
        ```

### 3. Configurar o Frontend
1.  Em um **novo terminal**, navegue até a pasta do frontend.
2.  Instale as dependências do Node.js:
    ```bash
    cd ../frontend 
    npm install
    ```

### 4. Iniciar os Servidores (3 Terminais)
Para o sistema funcionar, você precisa de **3 terminais rodando ao mesmo tempo**:

* **Terminal 1: Ollama (O Cérebro)**
    ```bash
    ollama serve
    ```

* **Terminal 2: Backend (O Corpo)**
    * (Na pasta `backend` com o `venv` ativado)
    ```bash
    uvicorn app.main:app --reload --port 8001
    ```

* **Terminal 3: Frontend (A Interface)**
    * (Na pasta `frontend`)
    ```bash
    npm run dev
    ```

### 5. Acessar a Aplicação
Com os três servidores rodando, acesse o endereço fornecido pelo `npm run dev` (geralmente `http://localhost:5173`) no seu navegador.

---

## ✒️ Autora

* **Thauanny da Cruz** - [GitHub](https://github.com/ThauannydaCruzz)

---
## 📄 Licença
Este projeto pode ser distribuído sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.
