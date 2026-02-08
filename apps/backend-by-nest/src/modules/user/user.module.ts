import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserService } from './user.service';
import { UserController } from './user.controller';

import { User } from './entities/user.entity';
import { Post } from '../post/entities/post.entity';
import { Collection } from './entities/collection.entity';
import { Follow } from './entities/follow.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Post, Collection, Follow])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
