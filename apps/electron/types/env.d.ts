declare namespace NodeJS {
  interface ProcessEnv {
    NODE_API_ORIGIN: string
    NODE_ENV: 'development' | 'production'
  }
}
