import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import type { JwtPayload } from '../interface/jwt-payload.interface';
import { AuthRequest } from '../interface/auth-request.interface';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest<AuthRequest>();
    const authHeader = req.headers['authorization'];

    if (!authHeader) throw new UnauthorizedException('未登录');

    const token = authHeader.split(' ')[1];
    if (!token) throw new UnauthorizedException('未登录');

    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      req.user = { id: payload.id };
      return true;
    } catch {
      throw new UnauthorizedException('登录状态过期，请重新登录');
    }
  }
}
