// src/pages/Welcome.tsx
// VERSÃO SIMPLIFICADA - SEM ANIMAÇÃO DE DIGITAÇÃO
import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button"; // Confirme o caminho
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"; // Confirme o caminho
import AegisFaceAnimation from "../components/AegisFaceAnimation"; // Confirme o caminho
import {
  AEGIS_DEFAULT_GREETING,
  AEGIS_LOADING_MESSAGE,
  AEGIS_LOGIN_PROMPT,
  // TYPING_SPEED, // Não é mais necessário aqui
} from "../constants/constants"; // Confirme o caminho

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
}

const Welcome: React.FC = () => {
  console.log("WELCOME.TSX - SIMPLIFICADO (SEM DIGITAÇÃO) - Timestamp:", new Date().toISOString());

  const { isAuthenticated, isLoading: authIsLoading } = useAuth() as AuthContextType;
  const navigate = useNavigate();

  // 'displayText' agora guarda a string que será exibida diretamente.
  const [displayText, setDisplayText] = useState<string>(() => {
    return authIsLoading ? AEGIS_LOADING_MESSAGE : AEGIS_DEFAULT_GREETING;
  });

  useEffect(() => {
    let currentTextToShow = "";
    if (authIsLoading) {
      currentTextToShow = AEGIS_LOADING_MESSAGE;
    } else {
      if (isAuthenticated) {
        currentTextToShow = AEGIS_DEFAULT_GREETING;
      } else {
        currentTextToShow = AEGIS_LOGIN_PROMPT;
      }
    }
    setDisplayText(currentTextToShow);

    // ***** CONSOLE LOG CRÍTICO *****
    // Verifique o valor de 'currentTextToShow' que está sendo definido.
    console.log(
      "WELCOME.TSX (SIMPLIFICADO): `displayText` foi definido para ->",
      `"${currentTextToShow}"`
    );
  }, [isAuthenticated, authIsLoading]); // Dependências corretas

  const handleNextClick = () => {
    if (isAuthenticated) {
      navigate("/chatbot");
    } else {
      navigate("/login");
    }
  };

  const overallIsLoading = authIsLoading;

  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center px-4 py-8">
      {/* AegisFaceAnimation não precisa mais de 'isTyping' ou 'overallTypingComplete' da mesma forma */}
      {/* Poderia ter uma lógica mais simples aqui, ou apenas mostrar a face estática */}
      <AegisFaceAnimation isTyping={false} overallTypingComplete={!overallIsLoading && displayText !== AEGIS_LOADING_MESSAGE} />

      <div className="w-full max-w-md mx-auto text-center mb-10">
        <h1 className="text-3xl font-medium text-aegis-purple mb-2">
          Aegis Security
        </h1>
        {/* O texto agora é exibido diretamente, sem animação de digitação */}
        <p className="text-xl text-white min-h-[6rem] whitespace-pre-wrap">
          {displayText}
        </p>
      </div>

      <Button
        onClick={handleNextClick}
        className="w-full max-w-md bg-aegis-purple hover:bg-aegis-purple/90 text-white rounded-full py-6 text-lg"
        disabled={overallIsLoading} // Removido 'isTyping' da condição de desabilitar
      >
        {overallIsLoading
          ? "Carregando..."
          : isAuthenticated
          ? "Prosseguir"
          : "Fazer Login"}
      </Button>

      {!isAuthenticated && !overallIsLoading && (
         <p className="text-white/70 text-sm mt-4 text-center">
            Você precisa estar logado para usar o Aegis Chatbot.
        </p>
      )}
      <p className="text-white/60 text-sm mt-6 text-center max-w-md">
        O Aegis utiliza criptografia avançada para proteger seus dados. Suas
        informações nunca são compartilhadas com terceiros.
      </p>
    </div>
  );
};

export default Welcome;