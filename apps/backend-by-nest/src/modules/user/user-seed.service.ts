import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { UserPermission } from './entities/user-permission.entity';
import bcrypt from 'bcryptjs';
import { Permission } from './entities/permission.entity';
import { AdminPerm, UserPerm } from 'src/common/constant/permission.constant';

@Injectable()
export class UserSeedService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(UserPermission)
    private readonly userPermRepository: Repository<UserPermission>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async onApplicationBootstrap() {
    const count = await this.userRepository.count();

    if (count === 0) {
      const password = await bcrypt.hash('admin123', 10);
      const userId = 'u00000';

      const user = this.userRepository.create({
        userId,
        userPassword: password,
        username: 'admin',
        userEmail: 'admin@forum.com',
        userPermMask: 7,
        adminPermMask: 7,
      });
      await this.userRepository.save(user);

      const perm1 = this.permissionRepository.create({
        id: 1,
        code: UserPerm.user_speak,
        name: '发言',
        scope: 'user',
      });

      const perm2 = this.permissionRepository.create({
        id: 2,
        code: UserPerm.user_post,
        name: '发帖',
        scope: 'user',
      });

      const perm3 = this.permissionRepository.create({
        id: 3,
        code: UserPerm.user_login,
        name: '允许登录',
        scope: 'user',
      });

      const perm4 = this.permissionRepository.create({
        id: 4,
        code: AdminPerm.post_review,
        name: '审核帖子',
        scope: 'admin',
      });

      const perm5 = this.permissionRepository.create({
        id: 5,
        code: AdminPerm.report_review,
        name: '审核帖子/评论举报',
        scope: 'admin',
      });

      const perm6 = this.permissionRepository.create({
        id: 6,
        code: AdminPerm.user_perm_modify,
        name: '修改用户权限',
        scope: 'admin',
      });

      await this.permissionRepository.save(perm1);
      await this.permissionRepository.save(perm2);
      await this.permissionRepository.save(perm3);
      await this.permissionRepository.save(perm4);
      await this.permissionRepository.save(perm5);
      await this.permissionRepository.save(perm6);

      const userSpeakPerm = this.userPermRepository.create({
        userId,
        permissionId: 1,
      });

      const userPostPerm = this.userPermRepository.create({
        userId,
        permissionId: 2,
      });

      const userLoginPerm = this.userPermRepository.create({
        userId,
        permissionId: 3,
      });

      const postReviewPerm = this.userPermRepository.create({
        userId,
        permissionId: 4,
      });

      const reportReviewPerm = this.userPermRepository.create({
        userId,
        permissionId: 5,
      });

      const userPermModifyPerm = this.userPermRepository.create({
        userId,
        permissionId: 6,
      });

      await this.userPermRepository.save(userSpeakPerm);
      await this.userPermRepository.save(userPostPerm);
      await this.userPermRepository.save(userLoginPerm);
      await this.userPermRepository.save(postReviewPerm);
      await this.userPermRepository.save(reportReviewPerm);
      await this.userPermRepository.save(userPermModifyPerm);
    }
  }
}
