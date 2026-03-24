import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Comment } from './entities/comment.entity';
import { UserModule } from '../user/user.module';
import { PostReport } from './entities/post-report.entity';
import { CommentReport } from './entities/comment-report.entity';
import { SseModule } from '../sse/sse.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, Comment, PostReport, CommentReport]),
    UserModule,
    SseModule,
  ],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
