import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import {
  AdminPermissionCodeToBitMap,
  UserPermissionIdToBitMap,
} from './auth.map';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async recalcUserPermission(userId: string) {
    const user = await this.userRepository.findOne({
      where: { userId },
      relations: ['perms'],
    });

    if (!user) throw new Error('User not found');

    const userPermsIds: number[] = [];
    const adminPermsIds: number[] = [];
    let userPermMask = 0;
    let adminPermMask = 0;

    user?.perms.forEach((perm) => {
      if (perm.id <= 3) {
        userPermsIds.push(perm.id);
      } else {
        adminPermsIds.push(perm.id);
      }
    });

    if (userPermsIds.length !== 0) {
      userPermsIds.forEach((id) => {
        userPermMask ^= UserPermissionIdToBitMap[id]!;
      });

      await this.userRepository.update({ userId }, { userPermMask });
    } else {
      await this.userRepository.update({ userId }, { userPermMask: 0 });
    }

    if (adminPermsIds.length !== 0) {
      adminPermsIds.forEach((id) => {
        adminPermMask ^= AdminPermissionCodeToBitMap[id]!;
      });

      await this.userRepository.update({ userId }, { adminPermMask });
    } else {
      await this.userRepository.update({ userId }, { adminPermMask: 0 });
    }
  }
}
