import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from 'src/modules/user/user.service';
import { AuthRequest } from '../interface/auth-request.interface';
import { UserPermissionBit } from 'src/modules/auth/auth.bit';

@Injectable()
export class LoginProhibitGuard implements CanActivate {
  constructor(private userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthRequest>();
    const userId = req.user.id;

    const user = await this.userService.findOne(userId);

    if ((user.userPermMask & UserPermissionBit.LOGIN) === 0) {
      throw new UnauthorizedException('该账号被永久封禁');
    }

    return true;
  }
}
