import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserPermission } from '../user/entities/user-permission.entity';
import { Repository } from 'typeorm';
import {
  AdminPermissionCodeToIdMap,
  UserPermissionCodeToIdMap,
} from '../auth/auth.map';
import { AuthService } from '../auth/auth.service';
import { User } from '../user/entities/user.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(UserPermission)
    private readonly userPermissionRepository: Repository<UserPermission>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly authService: AuthService,
  ) {}
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
}
