import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { JwtPayload } from '../interface/jwt-payload.interface';

@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      req.user = null;
      return true;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      req.user = null;
      return true;
    }

    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      req.user = { id: payload.id };
    } catch {
      req.user = null;
    }

    return true;
  }
}
