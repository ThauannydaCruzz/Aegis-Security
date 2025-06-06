# app/services/report_generator.py
from datetime import datetime
import re

def get_initial_complaint(context: list) -> str:
    """
    Encontra a primeira mensagem do usuário que descreve o problema.
    """
    for msg in context:
        if msg.get("role") == "user":
            greetings = ["oi", "olá", "bom dia", "boa tarde", "boa noite"]
            content_lower = msg.get("content", "").lower().strip()
            if content_lower not in greetings and len(content_lower) > 4:
                return msg.get("content", "Não foi possível identificar a queixa inicial.")
    return "Não foi possível identificar a queixa inicial."

def gerar_relatorio_whatsapp(
    user_nome: str, 
    contexto_completo: list, 
    gravidade: str, 
    diagnostico: str, 
    status_final: str, 
    solucoes_sugeridas: str
) -> str:
    """
    Gera uma mensagem de relatório de WhatsApp estruturada, resumida e com limite de caracteres.
    """
    print(f"--- DENTRO DE gerar_relatorio_whatsapp ---")
    print(f"  User: {user_nome}, Gravidade: {gravidade}, Diagnóstico: {diagnostico}, Status: {status_final}")
    
    now = datetime.now().strftime('%d/%m/%Y %H:%M')
    
    status_legivel = status_final.replace(" (usuário indicou)", "").replace(" pelo chatbot", "")
    gravidade = gravidade or "Não Avaliada"
    diagnostico = diagnostico or "Nenhum diagnóstico registrado."
    
    if solucoes_sugeridas and "Espero que estas orientações ajudem" in solucoes_sugeridas:
        solucoes_sugeridas = solucoes_sugeridas.split("\n\nEspero que estas orientações ajudem")[0]
    solucoes_sugeridas = solucoes_sugeridas or "Nenhuma solução específica registrada."
    if len(solucoes_sugeridas) > 250:
        solucoes_sugeridas = solucoes_sugeridas[:250] + "..."

    problema_inicial = get_initial_complaint(contexto_completo)

    resumo_interacoes = ""
    ultimas_interacoes = [m for m in contexto_completo if m.get("role") in ["user", "assistant"]]
    
    # Pega as últimas 6 interações para o resumo
    if len(ultimas_interacoes) > 6:
        ultimas_interacoes = ultimas_interacoes[-6:]

    for msg in ultimas_interacoes:
        role = "Usuário" if msg.get("role") == "user" else "Aegis"
        content = msg.get("content", "").strip()
        if role == "Aegis" and "sou aegis, seu especialista" in content.lower():
            continue
        resumo_interacoes += f"*{role}:* _{content}_\n\n"

    report_template = f"""🔒 *Aegis - Relatório de Interação*

👤 *Usuário:* {user_nome}
📅 *Data/Hora:* {now}
STATUS FINAL: *{status_legivel}*
GRAVIDADE (sugerida): *{gravidade}*
DIAGNÓSTICO (final): _{diagnostico}_

SOLUÇÕES/ORIENTAÇÕES FORNECIDAS:
_{solucoes_sugeridas}_
------------------------
🗣️ *ÚLTIMAS INTERAÇÕES:*
{resumo_interacoes.strip()}
------------------------
Fim do resumo automático."""

    final_report = "\n".join(line.strip() for line in report_template.strip().split('\n'))
    print(f"  Relatório formatado (report_generator.py): {final_report[:100]}...")
    
    # Garante que o relatório final não exceda o limite do WhatsApp
    if len(final_report) > 1590: # Deixa uma margem de segurança
        final_report = final_report[:1590] + "\n... (relatório truncado por tamanho)"
        
    return final_report