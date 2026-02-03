declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test'
    ORIGIN?: any
    CORS_ORIGIN: string
    CORS_ORIGIN_1: string
    CORS_ORIGIN_2: string
    CORS_ORIGIN_3: string
    SERVER_HOST?: string
    PORT?: string
    SECRET_KEY: string
    JWT_SECRET: string
    DB_HOST?: string
    DB_USER?: string
    DB_PASSWORD?: string
    DB_NAME?: string
    API_KEY: string
  }
}

declare namespace Express {
  interface Request {
    user?: { id: string }
  }
}
