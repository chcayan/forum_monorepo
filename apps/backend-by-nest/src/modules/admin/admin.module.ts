import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPermission } from '../user/entities/user-permission.entity';
import { User } from '../user/entities/user.entity';
import { UserModule } from '../user/user.module';
import { Post } from '../post/entities/post.entity';
import { ReviewViolationReason } from './entities/review-violation-reason.entity';
import { PostReport } from '../post/entities/post-report.entity';
import { UserLog } from './entities/user-log.entity';
import { CommentReport } from '../post/entities/comment-report.entity';
import { Comment } from '../post/entities/comment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserPermission,
      User,
      Post,
      ReviewViolationReason,
      PostReport,
      UserLog,
      CommentReport,
      Comment,
    ]),
    UserModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
