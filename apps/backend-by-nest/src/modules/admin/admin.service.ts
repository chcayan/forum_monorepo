import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserPermission } from '../user/entities/user-permission.entity';
import { Repository } from 'typeorm';
import {
  AdminPermissionCodeToIdMap,
  UserPermissionCodeToIdMap,
} from '../auth/auth.map';
import { AuthService } from '../auth/auth.service';
import { User } from '../user/entities/user.entity';
import { Post } from '../post/entities/post.entity';
import { UserAlias, UserFields } from '../user/user.constant';
import { AdminPermissionBit, UserPermissionBit } from '../auth/auth.bit';
import bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { AdminPerm } from 'src/common/constant/permission.constant';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(UserPermission)
    private readonly userPermissionRepository: Repository<UserPermission>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Post) private readonly postRepository: Repository<Post>,
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}
  async login(email: string, password: string) {
    const user = await this.userRepository
      .createQueryBuilder(UserAlias)
      .addSelect(UserFields.userPassword)
      .where(`${UserFields.userEmail} = :userEmail`, { userEmail: email })
      .getOne();

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    const userPermMask = user.userPermMask;
    const adminPermMask = user.adminPermMask;
    if ((userPermMask & UserPermissionBit.LOGIN) === 0) {
      throw new ForbiddenException('账号封禁中');
    }

    const isMatch = await bcrypt.compare(password, user.userPassword);

    if (!isMatch) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const token = this.jwtService.sign({
      id: user.userId,
    });

    const permissions = this.createPermissionsObj(userPermMask, adminPermMask);

    return { token, permissions };
  }

  createPermissionsObj(userPermMask: number, adminPermMask: number) {
    // const userPermission: string[] = [];
    const adminPermission: string[] = [];

    // if ((userPermMask & UserPermissionBit.SPEAK) !== 0) {
    //   userPermission.push(UserPerm.user_speak);
    // }

    // if ((userPermMask & UserPermissionBit.POST) !== 0) {
    //   userPermission.push(UserPerm.user_post);
    // }

    // if ((userPermMask & UserPermissionBit.LOGIN) !== 0) {
    //   userPermission.push(UserPerm.user_login);
    // }

    if ((adminPermMask & AdminPermissionBit.AUDIT_POST) !== 0) {
      adminPermission.push(AdminPerm.audit_post);
    }

    if ((adminPermMask & AdminPermissionBit.EDIT_POST) !== 0) {
      adminPermission.push(AdminPerm.edit_post);
    }

    if ((adminPermMask & AdminPermissionBit.EDIT_USER) !== 0) {
      adminPermission.push(AdminPerm.edit_user);
    }

    // return {
    //   user: userPermission,
    //   admin: adminPermission,
    // };
    return AdminPerm;
  }

  async addUserPermission(userId: string, permission: string) {
    const user = await this.userRepository.findOne({
      where: {
        userId,
      },
    });
    if (!user) throw new BadRequestException('未找到该用户');

    if (!(permission in UserPermissionCodeToIdMap)) {
      throw new BadRequestException('非法权限码');
    }

    const up = this.userPermissionRepository.create({
      userId,
      permissionId: UserPermissionCodeToIdMap[permission]!,
    });

    await this.userPermissionRepository.save(up);

    await this.authService.recalcUserPermission(userId);
  }

  async delUserPermission(userId: string, permission: string) {
    const user = await this.userRepository.findOne({
      where: {
        userId,
      },
    });
    if (!user) throw new BadRequestException('未找到该用户');

    if (!(permission in UserPermissionCodeToIdMap)) {
      throw new BadRequestException('非法权限码');
    }

    await this.userPermissionRepository.delete({
      userId,
      permissionId: UserPermissionCodeToIdMap[permission]!,
    });

    await this.authService.recalcUserPermission(userId);
  }

  async addAdminPermission(userId: string, permission: string) {
    const user = await this.userRepository.findOne({
      where: {
        userId,
      },
    });
    if (!user) throw new BadRequestException('未找到该用户');

    if (!(permission in AdminPermissionCodeToIdMap)) {
      throw new BadRequestException('非法权限码');
    }

    const up = this.userPermissionRepository.create({
      userId,
      permissionId: AdminPermissionCodeToIdMap[permission]!,
    });

    await this.userPermissionRepository.save(up);

    await this.authService.recalcUserPermission(userId);
  }

  async delAdminPermission(userId: string, permission: string) {
    const user = await this.userRepository.findOne({
      where: {
        userId,
      },
    });
    if (!user) throw new BadRequestException('未找到该用户');

    if (!(permission in AdminPermissionCodeToIdMap)) {
      throw new BadRequestException('非法权限码');
    }
    await this.userPermissionRepository.delete({
      userId,
      permissionId: AdminPermissionCodeToIdMap[permission]!,
    });

    await this.authService.recalcUserPermission(userId);
  }

  async auditPost(postId: string, status: 0 | 1 | 2) {
    const existPost = await this.postRepository.findOne({
      where: { pId: postId },
    });

    if (!existPost) {
      throw new NotFoundException('未找到该帖子');
    }

    await this.postRepository.update({ pId: postId }, { status });
  }
}
