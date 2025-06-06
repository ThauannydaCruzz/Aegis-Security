# Aegis Security - Plataforma Integrada de Cibersegurança

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white) ![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi&logoColor=white) ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) ![OpenCV](https://img.shields.io/badge/OpenCV-5C3EE8?style=for-the-badge&logo=opencv&logoColor=white) ![Pandas](https://img.shields.io/badge/Pandas-150458?style=for-the-badge&logo=pandas&logoColor=white) ![Twilio](https://img.shields.io/badge/Twilio-F22F46?style=for-the-badge&logo=twilio&logoColor=white)

**Aegis Security** é uma plataforma completa de cibersegurança projetada para oferecer uma solução integrada de proteção, análise e suporte ao usuário. O projeto combina um chatbot inteligente para atendimento de incidentes, um dashboard para visualização de dados e um sistema de reconhecimento facial para verificação de identidade e controle de acesso.

*(Aqui você pode adicionar um GIF demonstrando a plataforma em ação)*
`![Demonstração do Aegis](link_para_seu_gif.gif)`

---

## ✨ Funcionalidades do Projeto

A plataforma Aegis é composta por três módulos principais que trabalham de forma integrada:

### 1. 🤖 Chatbot de Suporte (Aegis Assistant)
Um assistente de IA para triagem e suporte primário de incidentes de segurança.
* **Diagnóstico Guiado:** Inicia um fluxo de perguntas para avaliar a gravidade de incidentes relatados por usuários (ex: invasão de sites, phishing, malware).
* **Base de Conhecimento:** Responde a perguntas gerais sobre termos e práticas de cibersegurança utilizando o modelo de linguagem `phi-3` via Ollama.
* **Soluções Direcionadas:** Oferece passos de ação imediatos e específicos para os problemas diagnosticados, utilizando respostas programadas de alta qualidade para os cenários mais comuns.
* **Notificações Críticas:** Permite que o usuário acione um botão de emergência que notifica instantaneamente a equipe de suporte via WhatsApp, utilizando a API da Twilio.
* **Geração de Relatórios:** Ao finalizar um atendimento através do botão dedicado, um relatório estruturado do incidente é enviado para a equipe, facilitando a análise posterior.

### 2. 📊 Dashboard de Segurança
Um painel de controle visual e interativo para monitoramento e análise de dados.
* **Visualização de Métricas:** Apresenta dados e insights sobre os atendimentos e incidentes de segurança registrados pelo chatbot, com gráficos gerados pela biblioteca `Recharts`.
* **Análise de Tendências:** Utiliza a biblioteca `pandas` no backend para agregar os dados das conversas, permitindo identificar os tipos de ataques mais comuns, a gravidade dos incidentes e outras métricas relevantes para a tomada de decisão.
* **Interface Responsiva:** Construído com componentes `shadcn/ui` e `Tailwind CSS` para uma experiência de usuário limpa e adaptável.

### 3. 👤 Sistema de Autenticação Segura
Uma solução robusta para gerenciamento de acesso, combinando métodos tradicionais e biométricos.
* **Autenticação por Token JWT:** Implementa um sistema de login e registro seguro, utilizando `passlib` para o hashing de senhas e JSON Web Tokens (JWT) para o gerenciamento de sessões.
* **Verificação por Reconhecimento Facial:** Utiliza a biblioteca `OpenCV` para capturar a imagem da webcam e a `face_recognition` para extrair as características faciais, comparando-as com um cadastro prévio para validar a identidade do usuário de forma rápida e segura.

---

## 🛠️ Tecnologias Utilizadas

| Categoria | Tecnologia | Propósito |
| :--- | :--- | :--- |
| **Backend** | Python, FastAPI, Uvicorn | Estrutura da API, gerenciamento de rotas e servidor. |
| | SQLAlchemy | ORM para comunicação com o banco de dados. |
| | Pandas | Manipulação e análise dos dados para o dashboard. |
| | Passlib & Python-JOSE | Segurança de senhas (hashing) e gerenciamento de tokens JWT. |
| **Inteligência Artificial**| Ollama & Phi-3 | Execução local do modelo de linguagem para as conversas do chatbot. |
| **Análise de Imagem** | OpenCV (`opencv-python`) | Captura e processamento de imagens da câmera para o reconhecimento facial. |
| | Face Recognition | Extração de características faciais e comparação para verificação biométrica. |
| **Comunicação** | Twilio API | Envio de notificações e relatórios via WhatsApp. |
| **Frontend** | React & TypeScript | Biblioteca principal e linguagem para a construção da interface de usuário. |
| | Shadcn/UI & Tailwind CSS | Componentes de UI e estilização moderna. |
| | Recharts | Biblioteca para a criação dos gráficos interativos no dashboard. |
| | Lucide-React | Biblioteca de ícones. |

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
3.  **Instale as dependências:** Crie um arquivo `requirements.txt` e adicione as bibliotecas necessárias. Depois, instale-as.
    ```bash
    # Exemplo do conteúdo do requirements.txt:
    # fastapi
    # uvicorn[standard]
    # requests
    # python-dotenv
    # twilio
    # SQLAlchemy
    # pandas
    # opencv-python
    # face_recognition
    # passlib[bcrypt]
    # python-jose[cryptography]

    pip install -r requirements.txt
    ```
4.  **Configure as variáveis de ambiente:**
    * Crie um arquivo chamado `.env` na pasta `backend` e preencha com suas chaves:
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
    # A partir da pasta raiz 'Aegis-Security'
    cd frontend 
    npm install
    ```

### 4. Iniciar os Servidores (Requer 3 Terminais)
Para o sistema funcionar, você precisa de **3 terminais rodando ao mesmo tempo**:

* **Terminal 1: Ollama (O Cérebro)**
    ```bash
    ollama serve
    ```

* **Terminal 2: Backend (A Lógica)**
    * (Na pasta `backend` com o `venv` ativado)
    ```bash
    uvicorn app.main:app --reload
    ```

* **Terminal 3: Frontend (A Interface)**
    * (Na pasta `frontend`)
    ```bash
    npm run dev
    ```

### 5. Acessar a Aplicação
Com os três servidores rodando, acesse o endereço fornecido pelo `npm run dev` (geralmente `http://localhost:5173`) no seu navegador.

