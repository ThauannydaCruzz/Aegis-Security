// src/constants/constants.ts
// !!!!! VERIFIQUE CADA CARACTERE DESTA STRING !!!!!
export const API_BASE_URL: string = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const AEGIS_DEFAULT_GREETING: string =
  "Eu sou o Aegis. Estou aqui para garantir a segurança dos seus dados e proteger sua privacidade.";
// ASSEGURE-SE QUE:
// 1. Começa com "Eu" (E maiúsculo, u minúsculo)
// 2. "garantir" está correto
// 3. "dados e proteger sua privacidade." está correto
// 4. NÃO HÁ ".undefined" ou qualquer outro erro no final, DENTRO DAS ASPAS.

export const AEGIS_LOADING_MESSAGE: string = "Carregando informações...";

export const AEGIS_LOGIN_PROMPT: string =
  "Eu sou o Aegis. Para começar, por favor, faça login ou crie uma conta.";

// Constantes da animação da face
export const FACE_EXPRESSIONS: string[] = ["neutral", "friendly", "thoughtful"];
export const EYE_BLINK_INTERVAL_MIN: number = 2000;
export const EYE_BLINK_INTERVAL_RANGE: number = 3000;
export const EYE_BLINK_DURATION: number = 150;
export const TALK_ANIMATION_DURATION_MIN: number = 100;
export const TALK_ANIMATION_DURATION_RANGE: number = 200;
export const EYE_SHIFT_DURATION: number = 800;
export const TYPING_SPEED: number = 50; // Não será usada nesta versão simplificada do Welcome.tsx