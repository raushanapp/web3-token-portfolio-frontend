/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_API_KEY: string
  readonly VITE_WALLET_CONNECT_PROJECT_ID: string
  readonly VITE_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}