import { Module } from '@nestjs/common';
import { TestService } from './test.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@/modules/user/entities/user.entity';
import { UserPermission } from '@/modules/user/entities/user-permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserPermission])],
  providers: [TestService],
})
export class TestModule {}
