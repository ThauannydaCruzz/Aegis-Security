# backend/app/routes/chat.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import requests
import os
from datetime import datetime
from app.utils.whatsapp import send_whatsapp_message 
from app.services.report_generator import gerar_relatorio_whatsapp
import re 
import traceback

router = APIRouter(prefix="/chat", tags=["chat"])

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434/api/chat")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "phi3")
SUPPORT_TEAM_WHATSAPP_NUMBER_FROM_ENV = os.getenv("SUPPORT_TEAM_WHATSAPP_NUMBER", "WhatsApp da equipe Aegis não configurado em .env")
TRANSCRIPT_SAVE_DIR = "chat_transcricoes" 
os.makedirs(TRANSCRIPT_SAVE_DIR, exist_ok=True)

PROMPT_SISTEMA_AEGIS = (
    "Assume that you are an advanced cybersecurity assistant named 'Aegis' specifically designed to help users in Brazil. Your sole focus is on providing accurate information and support for digital security issues exclusively within the realm of cybersecurity, with no knowledge outside this field or personal advice beyond it. You must adhere strictly to these guidelines:"
    "\n\n1. **Identidade e Propósito Principal:** Você é Aegis, um especialista em segurança digital. Seu objetivo é auxiliá-lo com sua privacidade online e cibersegurança. A aplicação fornecerá a saudação inicial completa."
    "\n\n2. **APRESENTAÇÃO (Se Necessário):** Se for sua primeira resposta significativa após a saudação da aplicação, introduza-se brevemente: 'Sou Aegis, seu especialista em segurança digital. Estou aqui para ajudar.' antes de responder à pergunta do usuário."
    "\n\n3. **FOCO EM CIBERSEGURANÇA (COM INTELIGÊNCIA):** Sua especialidade é cibersegurança. Isso INCLUI ajudar usuários a entender conceitos, fornecer dicas práticas (como criar senhas fortes e dar exemplos de estruturas de senhas fortes), orientar sobre prevenção de golpes, e auxiliar no diagnóstico inicial de incidentes. Se o usuário perguntar sobre tópicos COMPLETAMENTE não relacionados (ex: culinária, esportes), responda educadamente: 'Minha especialidade é exclusivamente cibersegurança e privacidade online. Não tenho informações sobre outros temas, mas posso ajudar com qualquer dúvida de segurança digital.' **Ao definir um termo de cibersegurança, atenha-se estritamente ao conceito perguntado. Por exemplo, se a pergunta for sobre 'invasão', defina 'invasão' em geral, não apenas um tipo específico como phishing.**"
    "\n\n4. **NÃO INVENTE SERVIÇOS ou Informações Fora do Seu Alcance:** Não ofereça 'gerenciamento remoto', 'ligações', ou acesso a sistemas do usuário. Se não puder realizar uma ação específica (ex: verificar a conta do usuário diretamente), explique a limitação e ofereça orientações que o usuário possa seguir ou sugira contato com suporte apropriado se a aplicação assim instruir."
    "\n\n5. **PEDIDO DE CONTATO DA EQUIPE:** Se o usuário pedir contato com a equipe Aegis (telefone, WhatsApp), sua ÚNICA resposta DEVE SER: 'Entendido.'. A aplicação fornecerá os detalhes."
    "\n\n6. **LINGUAGEM, TOM E EXTENSÃO DA RESPOSTA (IMPORTANTE E OTIMIZADO):** Use português brasileiro profissional, mas principalmente ACESSÍVEL, AMIGÁVEL e EMPÁTICO. **SEMPRE PRIORIZE RESPOSTAS CURTAS E DIRETAS (1 a 3 frases)**. Explicações longas devem ser uma exceção clara, usada apenas para fornecer passos cruciais de uma solução. Seja o mais objetivo possível para agilizar a conversa."
    "\n\n7. **FORMATO DA RESPOSTA (CRÍTICO E OBRIGATÓRIO):** APENAS texto puro em português do Brasil. É TERMINANTEMENTE PROIBIDO incluir: emojis, formatação como negrito ou itálico, asteriscos, listas com marcadores (exceto para passo-a-passo numerado, se essencial), qualquer metatexto, comentários de desenvolvedor, ou QUALQUER TEXTO EM OUTRO IDIOMA."
    "\n\n8. **EXEMPLOS PRÁTICOS (Quando Apropriado):** Ao explicar conceitos como 'senha forte', forneça dicas e exemplos de ESTRUTURAS de senhas fortes (ex: 'Fr4s&Complet@1!')."
    "\n\nMAIS DIRETRIZES IMPORTANTES:"
    "\n9. **IDENTIDADE:** Você é Aegis. Não se refira a si como IA."
    "\n10. **DÚVIDAS VS. RELATO DE PROBLEMA VS. SAUDAÇÕES GENÉRICAS:**"
    "\n    a. **PERGUNTA EXPLICATIVA (ex: 'o que é um ataque cibernético?', 'como criar uma senha forte?'):** RESPONDA DIRETAMENTE de forma objetiva."
    "\n    b. **RELATO DIRETO DE PROBLEMA ('fui invadido'):** Sua PRIMEIRA resposta deve ser UMA ÚNICA E CURTA FRASE de empatia. A APLICAÇÃO fará as perguntas de diagnóstico."
    "\n    c. **SAUDAÇÕES GENÉRICAS ('oi'):** Responda de forma amigável e aberta: 'Olá! Como posso te ajudar com sua segurança digital hoje?'."
    "\n11. **FLUXO DE DIAGNÓSTICO GUIADO PELA APLICAÇÃO:** Sua função é fornecer informações relevantes e os PRIMEIROS PASSOS ACIONÁVEIS para o problema diagnosticado pela aplicação. Seja claro e didático."
    "\n12. **FINALIZAÇÃO PELO USUÁRIO ('obrigado', 'tchau'):** Se o usuário indicar que quer encerrar a conversa, responda com uma mensagem curta e amigável como 'Disponha! Se precisar de algo mais, é só chamar.' e deixe o controle com ele para usar o botão de finalizar."
    "\n13. **APÓS PERGUNTA DE RESOLUÇÃO DA APLICAÇÃO ('...resolveu?'):** Se o usuário responder 'sim', sua resposta deve ser um reconhecimento positivo e curto ('Ótimo! Fico feliz em ajudar.'). Se responder 'não', um reconhecimento empático ('Entendido. Lamento não ter resolvido completamente.'). Em ambos os casos, a conversa continua. Você NÃO deve gerar nenhuma outra resposta ou finalizar o chat."
)

PALAVRAS_CHAVE_SUPORTE = [ "falar com atendente", "falar com um atendente", "falar com humano", "suporte humano", "atendimento presencial", "falar com alguem", "falar com alguém", "quero falar com alguem", "quero falar com alguém", "contatar a equipe", "whatsapp da equipe", "falar com a equipe aegis", "contato da aegis", "equipe aegis", "quero um especialista", "preciso de um especialista", "quero suporte tecnico", "suporte técnico", "telefone para contato", "numero para contato", "qual o telefone", "qual o whatsapp", "passa o contato", "me passa o contato", "ligar para vocês", "falar com vocês", "ser colocado em espera", "aguardar na linha", "quero o contato", "preciso do contato" ]
PALAVRAS_CHAVE_FINALIZACAO = [ "ok obrigada", "ok obrigado", "ok, obrigada", "ok, obrigado", "obrigado.", "obrigada.", "obrigado!", "obrigada!", "muito obrigado", "muito obrigada", "tudo certo então", "tudo certo", "era só isso", "era somente isso", "por enquanto é só", "só isso mesmo", "pode finalizar", "pode encerrar", "finalizar conversa", "encerrar atendimento", "encerrar", "finalizar", "grato", "grata", "agradecido", "agradecida", "valeu", "satisfeito", "satisfeita", "sem mais perguntas", "nada mais", "tchau", "até mais", "até logo" ]
KEYWORDS_INICIAR_ANALISE_DIRETA = [ "invadido", "invadiram", "hackeado", "hackearam", "invasão", "ataque", "comprometeram", "comprometer", "acesso indevido", "atividade suspeita", "perdi o acesso", "minha senha foi modificada", "roubaram minha conta", "conta comprometida", "não consigo entrar", "phishing", "pishing", "fui vítima de phishing", "ataque de phishing", "email invadido", "meu email foi invadido", "invadiram meu email", "site invadido", "meu site foi invadido", "invadiram meu site", "website invadido", "ataque no meu site", "whatsapp clonado", "meu whatsapp foi clonado", "instagram invadido", "meu instagram foi invadido", "malware", "vírus", "computador lento", "meu computador está muito lento", "arquivo .exe", "baixou .exe", "abri um .exe", "cliquei em um anúncio e baixou", "sms golpe", "mensagem de golpe", "sms estranho", "mensagem estranha", "recebi um sms suspeito", "recebi um email suspeito", "link suspeito", "vazamento de dados", "dados vazados", "compra que não fiz", "cobrança indevida", "isso é golpe", "código de verificação", "codigo de verificacao", "código não solicitado", "2fa não solicitado" ]

class ChatInput(BaseModel): user: str; message: str; context: list = []
class FinalizeChatInput(BaseModel): user: str; context: list = []

def analisar_resposta_gravidade(message_text: str, ultima_pergunta_bot_local: str = "", diagnostico_pre_existente_lista: list = None):
    # ... (função sem alterações) ...
    print(f"     DEBUG analisar_resposta_gravidade: Recebido '{message_text}', Última pergunta: '{ultima_pergunta_bot_local[:70]}...'")
    resposta_lower = message_text.lower().strip(); 
    diagnosticos = list(set(diagnostico_pre_existente_lista)) if diagnostico_pre_existente_lista else []
    gravidade = None; 
    perdeu_acesso_kw = "perdi o acesso" in resposta_lower or "perdi acesso" in resposta_lower or "não consigo acessar" in resposta_lower or "bloqueado" in resposta_lower or ("sim" in resposta_lower and "acesso" in ultima_pergunta_bot_local)
    vazamento_info_kw = "vazamento de dados" in resposta_lower or "vazamento" in resposta_lower or "vazou" in resposta_lower or "dados expostos" in resposta_lower or "informações vazadas" in resposta_lower or ("sim" in resposta_lower and "vazado" in ultima_pergunta_bot_local)
    mov_financeira_kw = "movimentação financeira" in resposta_lower or "dinheiro sumiu" in resposta_lower or "compra não reconhecida" in resposta_lower or "golpe" in resposta_lower or ("sim" in resposta_lower and "financeira" in ultima_pergunta_bot_local)
    site_alterado_kw = ("sim" in resposta_lower and "alteração estranha" in ultima_pergunta_bot_local) or "conteúdo modificado" in resposta_lower
    if perdeu_acesso_kw and "Perda de acesso à conta/serviço" not in diagnosticos: diagnosticos.append("Perda de acesso à conta/serviço")
    if vazamento_info_kw and "Suspeita de vazamento de informações" not in diagnosticos: diagnosticos.append("Suspeita de vazamento de informações")
    if mov_financeira_kw and "Atividade financeira suspeita/não autorizada" not in diagnosticos: diagnosticos.append("Atividade financeira suspeita/não autorizada")
    if site_alterado_kw and "Conteúdo de site alterado" not in diagnosticos: diagnosticos.append("Conteúdo de site alterado")
    if "Perda de acesso à conta/serviço" in diagnosticos or "Atividade financeira suspeita/não autorizada" in diagnosticos: gravidade = "Alta"
    elif "Suspeita de vazamento de informações" in diagnosticos or "Conteúdo de site alterado" in diagnosticos or "Suspeita de Invasão de Website" in diagnosticos: gravidade = "Média"
    final_diagnostico_str = ", ".join(sorted(list(set(diagnosticos))))
    final_gravidade_str = gravidade if gravidade else "Baixa"
    print(f"     DEBUG analisar_resposta_gravidade: Retornando Gravidade='{final_gravidade_str}', Diagnóstico='{final_diagnostico_str}'")
    return final_gravidade_str, final_diagnostico_str

def _salvar_transcricao_chat(user_nome: str, contexto_completo: list, status_final: str, gravidade: str or None, diagnostico: str or None, solucoes: str or None):
    # ... (função sem alterações) ...
    try:
        timestamp_file = datetime.now().strftime("%Y%m%d_%H%M%S_%f"); safe_user_nome = "".join(c if c.isalnum() else "_" for c in user_nome); safe_user_nome = safe_user_nome if safe_user_nome else "anonimo"
        filename = os.path.join(TRANSCRIPT_SAVE_DIR, f"chat_aegis_{safe_user_nome}_{timestamp_file}.txt")
        with open(filename, "w", encoding="utf-8") as f:
            f.write(f"Transcrição Aegis\nUser: {user_nome}\nData: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}\nStatus: {status_final}\n")
            if gravidade: f.write(f"Gravidade: {gravidade}\n")
            if diagnostico: f.write(f"Diagnóstico: {diagnostico}\n")
            if solucoes: f.write(f"Soluções:\n{solucoes}\n")
            f.write("------------------\n\n"); [f.write(f"{user_nome if msg.get('role') == 'user' else 'Aegis'}: {msg.get('content', '')}\n\n") for msg in contexto_completo if msg.get("role") in ["user", "assistant"]]
            f.write("------------------\nFim.\n")
        print(f"     TRANSCRICAO SALVA: '{filename}'")
    except Exception as e: print(f"     ERRO AO SALVAR TRANSCRICAO: {e}\n{traceback.format_exc()}")

def _enviar_relatorio_final_conversa(user_nome: str, contexto_completo: list, gravidade: str or None, diagnostico: str or None, status_final: str, solucoes_sugeridas: str or None):
    # ... (função sem alterações) ...
    print(f"   ---> _enviar_relatorio_final_conversa: User='{user_nome}', Status='{status_final}'. Preparando...")
    _salvar_transcricao_chat(user_nome, contexto_completo, status_final, gravidade, diagnostico, solucoes_sugeridas)
    try:
        print(f"     Gerando e enviando relatório WhatsApp para Status='{status_final}', Gravidade='{gravidade}'")
        mensagem_relatorio = gerar_relatorio_whatsapp(user_nome, contexto_completo, gravidade, diagnostico, status_final, solucoes_sugeridas)
        send_whatsapp_message(mensagem_relatorio)
        print(f"     CHAMADA PARA send_whatsapp_message (relatório) CONCLUÍDA.")
    except Exception as e_report: 
        print(f"     ERRO AO ENVIAR RELATÓRIO WHATSAPP: {e_report}")
        print(f"     !!!! VERIFIQUE SUAS VARIÁVEIS DE AMBIENTE (.env) E A FUNÇÃO app.utils.whatsapp.send_whatsapp_message !!!!")
        print(traceback.format_exc())

def is_request_for_explanation(message_text: str):
    # ... (função sem alterações) ...
    msg_lower = message_text.lower().strip()
    print(f"     DEBUG is_request_for_explanation: Analisando '{msg_lower}'")
    explanation_triggers = [ "o que é", "oque é", "o que e", "oque e", "o que são", "o que sao", "oque são", "oque sao", "o que significa", "oque significa", "como funciona", "como ocorrem", "explique", "explica", "me fale sobre", "detalhes sobre", "qual a diferença", "qual a diferenca" ]
    for trigger in explanation_triggers:
        if msg_lower.startswith(trigger):
            print(f"     DEBUG is_request_for_explanation: TRUE (gatilho forte de início: '{trigger}')")
            return True
    if msg_lower.endswith('?'):
        personal_report_indicators = ["meu", "minha", "minhas", "meus", "sofri", "estou", "recebi", "aconteceu com"]
        if not any(indicator in msg_lower for indicator in personal_report_indicators):
            print("     DEBUG is_request_for_explanation: TRUE (pergunta sem indicadores de relato pessoal)")
            return True
    print(f"     DEBUG is_request_for_explanation: FALSE (default)")
    return False

def clean_ollama_response(text: str) -> str:
    # ... (função sem alterações) ...
    if not text: return ""
    cleaned_text = text
    cleaned_text = cleaned_text.replace('**', '').replace('*', '')
    padroes_remocao_criticos = [r"configura_ \*\*Note: The response was cut off.*$", r"\*\*Note: The response was cut off.*?(\n|$)", r"\[mensagem cortada\].*?(\n|$)", r"#### Instrucción.*?(\n|$)", r"^\s*\(Instrução para Aegis:.*?\)\s*$", r"^\s*instrução avanzada:.*", r"^\s*segundo instrucción.*", r"^\s*nota:.*", r"^\s*observação:.*", r"^\s*dica:.*", r"^\s*lembrete:.*", r"^\s*\(enriquecimento de las instrucciones.*"]
    for pattern in padroes_remocao_criticos:
        try:
            cleaned_text = re.sub(pattern, '', cleaned_text, flags=re.IGNORECASE | re.MULTILINE).strip()
        except re.error:
            print(f"     DEBUG clean_ollama_response: Erro de regex com padrão crítico '{pattern}'")
    cleaned_lines = []
    for line in cleaned_text.splitlines():
        if not line.strip(): continue
        line_cleaned = line
        padroes_parciais_remocao = [r'\([\w\s,.:\-]*instrução[\w\s,.:\-]*\)$',r'\([\w\s,.:\-]*nota[\w\s,.:\-]*\)$', r'\[[\w\s,.:\-]*instrução[\w\s,.:\-]*\]$',r'---.*?---$', r'\(instrução para aegis:.*?\)', r'instrução avanzada:.*', r'segundo instrucción.*',r'# Self-contained Question:']
        for pattern_partial in padroes_parciais_remocao:
            try: line_cleaned = re.sub(pattern_partial, '', line_cleaned, flags=re.IGNORECASE).strip()
            except re.error: pass
        if line_cleaned: cleaned_lines.append(line_cleaned)
    final_text = " ".join(cleaned_lines)
    return ' '.join(final_text.split())

def filter_context_for_ollama(context: list, max_messages: int = 8) -> list:
    """
    Filtra o histórico do chat para enviar ao Ollama, removendo mensagens de sistema
    internas e mantendo apenas as chaves 'role' e 'content'.
    """
    chat_history = [
        {"role": msg["role"], "content": msg["content"]}
        for msg in context
        if msg.get("role") in ["user", "assistant"] and "content" in msg
    ]
    return chat_history[-max_messages:]

@router.post("/")
def chat(input_data: ChatInput):
    print(f"\n--- ROTA /chat/ RECEBIDO --- User: {input_data.user}, Message: '{input_data.message}'")
    user_message_text = input_data.message.strip() if input_data.message is not None else ""
    user_message_lower = user_message_text.lower()
    context = list(input_data.context)
    end_conversation = False; resposta_bot_final = ""
    gravidade_conversa, diagnostico_conversa_str, status_conversa, solucoes_conversa, ultima_pergunta_bot = None, None, None, None, ""
    diagnosticos_acumulados_lista = [] 
    
    if context:
        for i in range(len(context) - 1, -1, -1):
            msg = context[i]; role = msg.get("role")
            if role == "system" and (msg.get("event", "").startswith("incident_flow") or "status" in msg):
                status_conversa = msg.get("status")
                gravidade_conversa = msg.get("gravidade_acumulada")
                diagnostico_conversa_str = msg.get("diagnostico_acumulado_str")
                if diagnostico_conversa_str: diagnosticos_acumulados_lista = [d.strip() for d in diagnostico_conversa_str.split(",") if d.strip()]
                solucoes_conversa = msg.get("solucoes_dadas")
                break 
        for i in range(len(context) - 1, -1, -1):
            if context[i].get("role") == "assistant": ultima_pergunta_bot = context[i].get("content", "").lower(); break
    print(f"  Contexto Recuperado Inicial: Status='{status_conversa}', Gravidade='{gravidade_conversa}', Diag Acumulado='{diagnosticos_acumulados_lista}'. UPB: '{ultima_pergunta_bot[:70]}...'")

    if not input_data.context and not user_message_text: 
        print("  Gerando saudação inicial e apresentação (hardcoded).")
        current_hour = datetime.now().hour; periodo_dia_verbal = "Boa noite"
        if 5 <= current_hour < 12: periodo_dia_verbal = "Bom dia"
        elif 12 <= current_hour < 18: periodo_dia_verbal = "Boa tarde"
        resposta_bot_final = (f"Olá! {periodo_dia_verbal}. Sou Aegis, seu especialista em segurança digital. Meu objetivo é auxiliá-lo com sua privacidade online e cibersegurança. Como posso ser útil hoje?")
        context.append({"role": "assistant", "content": resposta_bot_final})
        print(f"  Saudação Aegis (Hardcoded): '{resposta_bot_final}'")
        return {"resposta": resposta_bot_final, "context": context, "end_conversation": False}

    if user_message_text: context.append({"role": "user", "content": user_message_text})
    elif not input_data.context: return {"resposta": context[-1]["content"] if context and context[-1]["role"] == "assistant" else "Posso ajudar em algo mais?", "context": context, "end_conversation": False}

    if any(keyword in user_message_lower for keyword in PALAVRAS_CHAVE_SUPORTE):
        print("  Usuário solicitou suporte humano."); resposta_bot_parte1 = "Entendido."
        context.append({"role": "assistant", "content": resposta_bot_parte1})
        info_contato_equipe = (f"Para atendimento com a equipe Aegis, o WhatsApp é: {SUPPORT_TEAM_WHATSAPP_NUMBER_FROM_ENV}. Eles te auxiliarão. Sua solicitação foi registrada.")
        context.append({"role": "assistant", "content": info_contato_equipe})
        try: send_whatsapp_message(f"🔔 Usuário {input_data.user} ('{user_message_text[:50]}...') pediu contato com equipe Aegis.")
        except Exception as e: print(f"  ERRO notificar equipe (suporte): {e}")
        end_conversation = True; status_conversa = "Encaminhado ao Suporte Humano (Contato Fornecido)"; 
        _enviar_relatorio_final_conversa(input_data.user, context, gravidade_conversa, diagnostico_conversa_str, status_conversa, solucoes_conversa)
        resposta_bot_final = info_contato_equipe
        return {"resposta": resposta_bot_final, "context": context, "end_conversation": end_conversation}
    
    if any(kd in user_message_lower for kd in KEYWORDS_INICIAR_ANALISE_DIRETA) and status_conversa != "Análise pelo chatbot" and not is_request_for_explanation(user_message_text):
        print(f"  >>> PONTO 5: Detectado RELATO DIRETO: '{user_message_text}'. Iniciando fluxo de análise."); 
        status_conversa = "Análise pelo chatbot"; diagnosticos_acumulados_lista = []; gravidade_conversa = None; solucoes_conversa = None 
        resposta_empatia = "Entendido. Lamento que esteja passando por isso."
        pergunta_diagnostico_app = ""
        is_email_report = "email" in user_message_lower and any(kw in user_message_lower for kw in ["invasão", "invadido", "hackeado", "acesso"])
        is_site_report = ("site" in user_message_lower or "website" in user_message_lower) and any(kw in user_message_lower for kw in ["invasão", "invadido", "hackeado", "ataque"])
        is_sms_report = any(kw in user_message_lower for kw in ["sms", "mensagem"]) and any(kw in user_message_lower for kw in ["estranho", "suspeito", "golpe"])
        is_exe_report = any(kw in user_message_lower for kw in [".exe", "arquivo executável", "baixou um arquivo"])
        is_malware_report = any(kw in user_message_lower for kw in ["vírus", "malware", "computador lento"])
        is_code_report = any(kw in user_message_lower for kw in ["código", "verificação", "2fa"])
        
        proxima_pergunta_chave = "geral_acesso_resposta"
        if is_email_report:
            diagnosticos_acumulados_lista.append("Suspeita de Invasão de E-mail")
            pergunta_diagnostico_app = "Para entender melhor, você perdeu completamente o acesso a esse e-mail?"
        elif is_site_report:
            diagnosticos_acumulados_lista.append("Suspeita de Invasão de Website")
            pergunta_diagnostico_app = "Entendido. Você notou alguma alteração estranha no site, como conteúdo modificado ou posts que não fez?"
            proxima_pergunta_chave = "site_sintomas_resposta"
        elif is_sms_report or is_code_report:
            diag_sms = "Recebimento de código não solicitado" if is_code_report else "Suspeita de Phishing/Spam via SMS"
            diagnosticos_acumulados_lista.append(diag_sms)
            pergunta_diagnostico_app = "Você chegou a clicar em algum link, responder ou fornecer alguma informação?"
            proxima_pergunta_chave = "smishing_interacao_resposta"
        elif is_exe_report:
            diagnosticos_acumulados_lista.append("Alerta Crítico: Download/Execução de arquivo .exe suspeito"); gravidade_conversa = "Alta"
            pergunta_diagnostico_app = "Isso é de alto risco. Você chegou a abrir ou executar esse arquivo?"
            proxima_pergunta_chave = "exe_execucao_resposta"
        elif is_malware_report:
            diagnosticos_acumulados_lista.append("Suspeita de Malware/Vírus")
            pergunta_diagnostico_app = "Além da lentidão, notou outros comportamentos estranhos, como janelas abrindo sozinhas ou programas desconhecidos?"
            proxima_pergunta_chave = "malware_sintomas_resposta"
        else: 
            pergunta_diagnostico_app = "Para que eu possa entender melhor, você perdeu completamente o acesso a alguma conta ou serviço?"
        
        system_message_diagnostico = {"role": "system", "status": status_conversa, "event": "incident_flow_started", "diagnostico_acumulado_str": ", ".join(diagnosticos_acumulados_lista), "gravidade_acumulada": gravidade_conversa, "solucoes_dadas": None, "proxima_pergunta_diagnostico_chave": proxima_pergunta_chave}
        context.append(system_message_diagnostico)
        context.append({"role": "assistant", "content": resposta_empatia + " " + pergunta_diagnostico_app }); 
        return {"resposta": context[-1]["content"], "context": context, "end_conversation": False}

    elif status_conversa == "Análise pelo chatbot":
        print(f"  PONTO 6: FLUXO DE INCIDENTE: msg='{user_message_text}', UPB='{ultima_pergunta_bot[:100]}...'")
        
        proxima_chave_esperada = [msg.get("proxima_pergunta_diagnostico_chave") for msg in context if msg.get("role") == "system" and "proxima_pergunta_diagnostico_chave" in msg][-1] or "nenhuma"
        
        nova_gravidade, novo_diagnostico_parcial = analisar_resposta_gravidade(user_message_lower, ultima_pergunta_bot, diagnosticos_acumulados_lista)
        if novo_diagnostico_parcial: 
            diagnosticos_acumulados_lista = sorted(list(set(diagnosticos_acumulados_lista + [d.strip() for d in novo_diagnostico_parcial.split(",")])))
            diagnostico_conversa_str = ", ".join(diagnosticos_acumulados_lista)
            if nova_gravidade: gravidade_conversa = nova_gravidade
            print(f"     PONTO 6: Diagnóstico atualizado: G='{gravidade_conversa}', D='{diagnostico_conversa_str}'")
        
        ir_para_solucoes = False
        proxima_pergunta_app = ""
        proxima_pergunta_app_chave = "nenhuma"
        
        if proxima_chave_esperada == "site_sintomas_resposta":
            proxima_pergunta_app = "Certo. E você ainda consegue acessar o painel administrativo do seu site?"
            proxima_pergunta_app_chave = "geral_acesso_resposta"
        elif proxima_chave_esperada == "geral_acesso_resposta":
            proxima_pergunta_app = "Ok. E você suspeita que dados pessoais possam ter vazado?"
            proxima_pergunta_app_chave = "geral_vazamento_resposta"
        elif proxima_chave_esperada == "geral_vazamento_resposta":
            proxima_pergunta_app = "Entendido. Por último, notou alguma atividade financeira incomum que possa estar ligada a isso?"
            proxima_pergunta_app_chave = "geral_financeiro_resposta"
        else:
            ir_para_solucoes = True
            
        for i in range(len(context) - 1, -1, -1):
            if context[i].get("role") == "system" and context[i].get("event", "").startswith("incident_flow"):
                context[i].update({"diagnostico_acumulado_str": diagnostico_conversa_str, "gravidade_acumulada": gravidade_conversa, "proxima_pergunta_diagnostico_chave": proxima_pergunta_app_chave})
                break

        if not ir_para_solucoes:
            context.append({"role": "assistant", "content": proxima_pergunta_app})
            return {"resposta": proxima_pergunta_app, "context": context, "end_conversation": False}
        else:
            resposta_bot_orientacoes = ""
            if "Suspeita de Invasão de Website" in diagnostico_conversa_str:
                resposta_bot_orientacoes = "Entendido. Para uma invasão de site, os passos imediatos são: 1. Altere imediatamente as senhas do seu painel de controle (WordPress, etc.), FTP e da sua hospedagem. 2. Faça um backup completo do site como ele está agora para investigação. 3. Use um plugin de segurança como Wordfence ou Sucuri para escanear e remover arquivos maliciosos."
            
            if not resposta_bot_orientacoes:
                try:
                    instrucao_ollama_solucoes = (f"(Instrução para Aegis: Problema: '{diagnostico_conversa_str}', Gravidade: '{gravidade_conversa}'. Forneça os 3 passos mais importantes e imediatos, de forma breve e direta.)")
                    
                    # Filtra o contexto para enviar ao Ollama
                    mensagens_filtradas = filter_context_for_ollama(context, max_messages=9)
                    msgs_ollama_sol = [{"role": "system", "content": PROMPT_SISTEMA_AEGIS}] + mensagens_filtradas + [{"role": "user", "content": instrucao_ollama_solucoes}]
                    
                    payload_sol = {"model":OLLAMA_MODEL, "messages":msgs_ollama_sol, "stream":False, "options":{"num_predict": 450, "temperature":0.6}}
                    r_sol = requests.post(OLLAMA_URL, json=payload_sol); r_sol.raise_for_status() 
                    conteudo_sol = r_sol.json().get("message",{}).get("content")
                    if conteudo_sol: resposta_bot_orientacoes = clean_ollama_response(conteudo_sol)
                except Exception as e_sol: print(f"  ERRO Ollama (soluções - Bloco 6): {e_sol}")
            
            if not resposta_bot_orientacoes:
                resposta_bot_orientacoes = "Como recomendação geral, monitore suas contas, use senhas fortes e desconfie de mensagens inesperadas."
            
            resposta_bot_final = resposta_bot_orientacoes + "\n\nEspero que estas orientações ajudem. Se precisar de algo mais, é só perguntar. Para encerrar o atendimento, por favor, clique no botão 'Finalizar'."
            context.append({"role": "assistant", "content": resposta_bot_final})
            
            for i in range(len(context) - 2, -1, -1):
                if context[i].get("role") == "system" and context[i].get("event", "").startswith("incident_flow"):
                    context[i].update({"solucoes_dadas": resposta_bot_orientacoes, "status": "Aguardando Finalização do Usuário"})
                    break
            return {"resposta": resposta_bot_final, "context": context, "end_conversation": False}
    
    # Ponto 8: Fallback para perguntas gerais e finalizações
    print(f"  PONTO 8: Fallback para LLM (Geral): '{user_message_text}'")
    if any(keyword in user_message_lower for keyword in PALAVRAS_CHAVE_FINALIZACAO):
        resposta_bot_final = "Disponha! Se precisar de algo mais, estou à disposição. Lembre-se de clicar em 'Finalizar' para encerrar o nosso atendimento."
    else:
        try:
            # Filtra o contexto para enviar ao Ollama
            mensagens_filtradas = filter_context_for_ollama(context, max_messages=8)
            mensagens_para_ollama = [{"role": "system", "content": PROMPT_SISTEMA_AEGIS}] + mensagens_filtradas
            
            payload = {"model": OLLAMA_MODEL, "messages": mensagens_para_ollama, "stream": False, "options": {"num_predict": 250, "temperature": 0.5}}
            r = requests.post(OLLAMA_URL, json=payload); 
            r.raise_for_status()
            data_ollama = r.json(); 
            conteudo_ollama = data_ollama.get("message", {}).get("content")
            if conteudo_ollama: resposta_bot_final = clean_ollama_response(conteudo_ollama)
            else: resposta_bot_final = "Não tenho certeza de como responder a isso. Poderia tentar de outra forma?"
        except requests.exceptions.RequestException as e_req: 
            print(f"  ERRO OLLAMA (RequestException): {e_req}")
            resposta_bot_final = "Houve um problema na comunicação com o sistema de inteligência. Por favor, tente novamente mais tarde."
        except Exception as e_ollama_geral: 
            print(f"  ERRO INESPERADO AO PROCESSAR COM OLLAMA ({type(e_ollama_geral).__name__}): {e_ollama_geral}")
            print(traceback.format_exc())
            resposta_bot_final = "Ocorreu um erro inesperado ao processar sua solicitação."
            
    context.append({"role": "assistant", "content": resposta_bot_final})
    return {"resposta": resposta_bot_final, "context": context, "end_conversation": False}


@router.post("/finalize/", tags=["chat"])
def finalize_chat_session(input_data: FinalizeChatInput):
    print(f"\n--- ROTA /chat/finalize/ RECEBIDO --- User: {input_data.user}")
    context = list(input_data.context)
    gravidade_conversa, diagnostico_conversa_str, solucoes_conversa = None, None, None
    
    for i in range(len(context) - 1, -1, -1):
        msg = context[i]; role = msg.get("role")
        if role == "system" and msg.get("event", "").startswith("incident_flow"):
            if gravidade_conversa is None: gravidade_conversa = msg.get("gravidade_acumulada")
            if diagnostico_conversa_str is None: diagnostico_conversa_str = msg.get("diagnostico_acumulado_str")
            if solucoes_conversa is None: solucoes_conversa = msg.get("solucoes_dadas")
            if gravidade_conversa and diagnostico_conversa_str and solucoes_conversa: break
    
    status_final = "Finalizado pelo usuário (via botão)"
    final_diagnostico_para_relatorio = diagnostico_conversa_str or "Não detalhado."
    final_gravidade_para_relatorio = gravidade_conversa or "Não Avaliada"
    final_solucoes_para_relatorio = solucoes_conversa or "Nenhuma solução específica registrada."

    _enviar_relatorio_final_conversa(input_data.user, context, final_gravidade_para_relatorio, final_diagnostico_para_relatorio, status_final, final_solucoes_para_relatorio)
    
    resposta_bot_final = "Atendimento finalizado. O resumo da nossa conversa foi registrado. Obrigado por contatar o Aegis!"
    context.append({"role": "assistant", "content": resposta_bot_final})
    return {"resposta": resposta_bot_final, "context": context, "end_conversation": True}