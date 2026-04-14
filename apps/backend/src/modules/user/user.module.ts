import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserService } from './user.service';
import { UserController } from './user.controller';

import { User } from './entities/user.entity';
import { Post } from '../post/entities/post.entity';
import { Collection } from './entities/collection.entity';
import { Follow } from './entities/follow.entity';
import { Permission } from './entities/permission.entity';
import { UserPermission } from './entities/user-permission.entity';
import { UserSeedService } from './user-seed.service';
import { ReviewViolationReason } from '../admin/entities/review-violation-reason.entity';
import { UserLog } from '../admin/entities/user-log.entity';
import { Comment } from '../post/entities/comment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Post,
      Collection,
      Follow,
      Permission,
      UserPermission,
      ReviewViolationReason,
      UserLog,
      Comment,
    ]),
  ],
  controllers: [UserController],
  providers: [UserService, UserSeedService],
  exports: [UserService],
})
export class UserModule {}
