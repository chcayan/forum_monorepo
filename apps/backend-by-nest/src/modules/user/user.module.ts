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

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Post,
      Collection,
      Follow,
      Permission,
      UserPermission,
    ]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
