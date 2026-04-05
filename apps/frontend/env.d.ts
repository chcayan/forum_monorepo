/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SOCKET: string
  readonly VITE_SSE_URL: string
  readonly VITE_CN_VERSION: string
  readonly VITE_ICP_HTML: string
  readonly VITE_ICP_HTML_1: string
  readonly VITE_IS_ELECTRON: 'true' | 'false'
  readonly VITE_REQUEST_URL: string
  readonly VITE_IMAGE_URL: string
}
