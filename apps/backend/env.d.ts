declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test'
    ORIGIN?: any
    SERVER_HOST?: String
    PORT?: string
    SECRET_KEY: string
    JWT_SECRET: string
    DB_HOST?: string
    DB_USER?: string
    DB_PASSWORD?: string
    DB_NAME?: string
  }
}

declare namespace Express {
  interface Request {
    user?: { id: string }
  }
}
