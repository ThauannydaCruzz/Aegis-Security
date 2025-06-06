# backend/app/routes/dashboard_api.py

from fastapi import APIRouter, HTTPException
import os
import re # For extracting information from transcript files
from typing import List, Dict, Any # For typing
import traceback # For detailed error logging

# Define the transcript save directory (should match chat.py)
TRANSCRIPT_SAVE_DIR = "chat_transcricoes"

router_dashboard = APIRouter(prefix="/api", tags=["dashboard_insights"])

def parse_transcript_metadata(filepath: str) -> Dict[str, Any]:
    """
    Simple function to extract metadata from the transcript file header.
    """
    metadata: Dict[str, Any] = {"filename": os.path.basename(filepath)}
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            lines = f.readlines()
            for line in lines[:10]: # Read first 10 lines for metadata
                if line.startswith("User:"):
                    metadata["user"] = line.split("User:", 1)[1].strip()
                elif line.startswith("Data:"):
                    metadata["date"] = line.split("Data:", 1)[1].strip()
                elif line.startswith("Status:"):
                    metadata["status"] = line.split("Status:", 1)[1].strip()
                elif line.startswith("Gravidade:"):
                    metadata["gravidade"] = line.split("Gravidade:", 1)[1].strip()
                elif line.startswith("Diagnóstico:"):
                    metadata["diagnostico"] = line.split("Diagnóstico:", 1)[1].strip()
            
            if metadata.get("diagnostico"):
                metadata["topic"] = metadata["diagnostico"].split(",")[0].strip()
            elif metadata.get("status"):
                 metadata["topic"] = f"Status: {metadata['status']}"
            else:
                metadata["topic"] = "Conversa Geral" # Default topic
            
            metadata["details"] = f"Detalhes da transcrição: {os.path.basename(filepath)}"
            metadata["mentions"] = 1 # Placeholder; real counting logic needed

    except Exception as e:
        print(f"Erro ao parsear metadados de {filepath}: {e}")
        pass # Returns whatever was collected if an error occurs
    return metadata

@router_dashboard.get("/chatbot-insights", response_model=List[Dict[str, Any]])
async def get_chatbot_insights_data() -> List[Dict[str, Any]]:
    print("--- REQUISIÇÃO PARA /api/chatbot-insights RECEBIDA ---") # DEBUG
    insights_list: List[Dict[str, Any]] = []
    
    # Construct path to transcript directory relative to the project root
    # Assuming 'backend' is your project root or where you run FastAPI from
    project_root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")) 
    # This goes up two levels from routes/dashboard_api.py to the 'backend' folder.
    # If your 'chat_transcricoes' folder is directly inside 'backend/app/', adjust accordingly:
    # app_path = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    # transcript_path = os.path.join(app_path, TRANSCRIPT_SAVE_DIR)
    
    # More robust way if chat_transcricoes is at the same level as main.py (e.g. in 'backend' or project root)
    # Assumes TRANSCRIPT_SAVE_DIR is relative to where FastAPI is run.
    # If your structure is backend/app/routes and backend/chat_transcricoes
    # then the path needs to be relative to the execution directory of main.py
    current_execution_path = os.getcwd() # Path from where FastAPI is run
    transcript_path = os.path.join(current_execution_path, TRANSCRIPT_SAVE_DIR)
    
    print(f"Tentando acessar diretório de transcrições em: {transcript_path}") # DEBUG

    if not os.path.isdir(transcript_path):
        print(f"!!! ERRO: Diretório de transcrições NÃO ENCONTRADO em: {transcript_path}") # DEBUG
        # Return empty JSON or a specific JSON error message, instead of letting FastAPI return HTML for 404
        # raise HTTPException(status_code=404, detail=f"Diretório de transcrições não encontrado: {transcript_path}")
        return [{"id": "error", "type": "error", "topic": "Configuration Error", "details": f"Transcript directory not found at {transcript_path}. Please check backend configuration."}]


    try:
        filenames = sorted(os.listdir(transcript_path), reverse=True) # Most recent first
        print(f"Arquivos encontrados (primeiros 5): {filenames[:5]}") # DEBUG
        
        count = 0
        for filename in filenames:
            if filename.startswith("chat_aegis_") and filename.endswith(".txt"):
                filepath = os.path.join(transcript_path, filename)
                if not os.path.isfile(filepath): # Extra check
                    continue

                metadata = parse_transcript_metadata(filepath)
                
                insight_obj: Dict[str, Any] = {
                    "id": filename, # Using filename as unique ID
                    "type": metadata.get("status", "Geral"), # Using status as 'type' or default
                    "topic": metadata.get("topic", "Não especificado"),
                    "concern": metadata.get("diagnostico"), 
                    "request": None, 
                    "mentions": metadata.get("mentions", 0),
                    "details": metadata.get("details", f"Conteúdo de {filename}"),
                    "positive_percent": None, # Sentiment fields not generated by this simple parser
                    "neutral_percent": None,
                    "negative_percent": None,
                    "summary": None,
                }
                insights_list.append(insight_obj)
                count += 1
                if count >= 10: # Limit to, e.g., the 10 most recent insights
                    break
        
        print(f"Retornando {len(insights_list)} insights.") # DEBUG
        return insights_list

    except Exception as e:
        print(f"!!! ERRO EXCEÇÃO ao gerar insights: {e}") # DEBUG
        traceback.print_exc() # DEBUG - prints the full stack trace of the exception
        # Return a JSON error response instead of letting FastAPI default to HTML for 500
        raise HTTPException(status_code=500, detail=f"Erro interno do servidor ao processar insights: {str(e)}")