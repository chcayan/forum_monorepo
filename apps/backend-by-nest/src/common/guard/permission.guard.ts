import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthRequest } from '../interface/auth-request.interface';
import { UserService } from 'src/modules/user/user.service';
import { Permission } from '../constant/permission.constant';

@Injectable()
export class UserPermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.get<number>(
      Permission.user,
      context.getHandler(),
    );

    if (requiredPermission === undefined) {
      throw new Error('backend error: Guard not provide value');
    }

    const req = context.switchToHttp().getRequest<AuthRequest>();
    const userId = req.user.id;

    const user = await this.userService.findOne(userId);

    const userPermission = user.userPermMask;

    if ((userPermission & requiredPermission) === 0) {
      throw new ForbiddenException('权限不足');
    }

    return true;
  }
}

@Injectable()
export class AdminPermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.get<number>(
      Permission.admin,
      context.getHandler(),
    );

    if (requiredPermission === undefined) {
      throw new Error('backend error: Guard not provide value');
    }

    const req = context.switchToHttp().getRequest<AuthRequest>();
    const userId = req.user.id;

    const user = await this.userService.findOne(userId);

    const adminPermission = user.adminPermMask;

    if ((adminPermission & requiredPermission) === 0) {
      throw new ForbiddenException('权限不足');
    }

    return true;
  }
}
