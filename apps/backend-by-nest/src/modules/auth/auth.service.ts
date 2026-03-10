import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import {
  AdminPermissionCodeToBitMap,
  UserPermissionIdToBitMap,
} from './auth.map';
import Redis from 'ioredis';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly jwtService: JwtService,
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

  async save(userId: string, refreshToken: string, role: 'user' | 'admin') {
    const key = `refresh:${userId}:${role}`;

    // await this.redis.set(key, refreshToken, 'EX', 60 * 60 * 24 * 7);
    await this.redis.set(key, refreshToken, 'EX', 60 * 60 * 24 * 1);
  }

  async get(userId: string, role: 'user' | 'admin') {
    const key = `refresh:${userId}:${role}`;

    return this.redis.get(key);
  }

  async remove(userId: string, role: 'user' | 'admin') {
    const key = `refresh:${userId}:${role}`;

    await this.redis.del(key);
  }

  generateAccessToken(userId: string) {
    return this.jwtService.sign(
      { id: userId },
      { secret: process.env.ACCESS_SECRET, expiresIn: '15m' },
    );
  }

  async generateRefreshToken(userId: string, role: 'user' | 'admin') {
    const refreshToken = this.jwtService.sign(
      { id: userId },
      {
        secret: process.env.REFRESH_SECRET,
        expiresIn: '1d',
      },
    );

    await this.save(userId, refreshToken, role);

    return refreshToken;
  }
}
