import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPermission } from '../user/entities/user-permission.entity';
import { User } from '../user/entities/user.entity';
import { UserModule } from '../user/user.module';
import { Post } from '../post/entities/post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserPermission, User, Post]), UserModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
