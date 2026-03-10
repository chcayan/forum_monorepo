import 'express';

declare module 'express' {
  interface Request {
    user?: { id: string } | null;
    cookies?: { refreshToken: string } | null;
  }
}
