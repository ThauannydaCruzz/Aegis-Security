/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // Outras variáveis de ambiente
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}