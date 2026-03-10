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

    const accessToken = authHeader.split(' ')[1];
    if (!accessToken) {
      req.user = null;
      return true;
    }

    try {
      const payload = this.jwtService.verify<JwtPayload>(accessToken, {
        secret: process.env.ACCESS_SECRET,
      });
      req.user = { id: payload.id };
    } catch {
      req.user = null;
    }

    return true;
  }
}
