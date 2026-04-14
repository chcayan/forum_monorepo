import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthRequest } from '../interface/auth-request.interface';
import { UserService } from '@/modules/user/user.service';
import { Permission } from '../constant/permission.constant';
import { formatRemainTimeWithText } from '../utils/date.utils';

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
      if (requiredPermission === 1) {
        throw new ForbiddenException('您已被永久禁言');
      }

      if (requiredPermission === 2) {
        throw new ForbiddenException('您已被永久禁止发帖');
      }

      throw new ForbiddenException('权限不足');
    }

    if (
      requiredPermission === 1 &&
      user.muteUntil &&
      new Date(user.muteUntil) > new Date()
    ) {
      const time = formatRemainTimeWithText(user.muteUntil);
      throw new ForbiddenException(`你已被禁言，还剩${time}解除`);
    }

    if (
      requiredPermission === 2 &&
      user.postProhibitUntil &&
      new Date(user.postProhibitUntil) > new Date()
    ) {
      const time = formatRemainTimeWithText(user.postProhibitUntil);
      throw new ForbiddenException(`你已被禁止发帖，还剩${time}解除`);
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
