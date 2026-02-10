import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPermission } from '../user/entities/user-permission.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserPermission, User])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
