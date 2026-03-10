import { Request } from 'express';

export interface AuthRequest extends Request {
  user: {
    id: string;
  };
  cookies: {
    refreshToken: string;
  };
}
