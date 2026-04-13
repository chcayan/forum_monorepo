import { AppController } from './app.controller';
import { AppService } from './app.service';

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import { PostModule } from './modules/post/post.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { ChatModule } from './modules/chat/chat.module';
import { AdminModule } from './modules/admin/admin.module';

import { Post } from './modules/post/entities/post.entity';
import { User } from './modules/user/entities/user.entity';
import { Collection } from './modules/user/entities/collection.entity';
import { Follow } from './modules/user/entities/follow.entity';
import { Comment } from './modules/post/entities/comment.entity';
import { Chat } from './modules/chat/entities/chat.entity';
import { Permission } from './modules/user/entities/permission.entity';
import { UserPermission } from './modules/user/entities/user-permission.entity';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ReviewViolationReason } from './modules/admin/entities/review-violation-reason.entity';
import { PostReport } from './modules/post/entities/post-report.entity';
import { UserLog } from './modules/admin/entities/user-log.entity';
import { CommentReport } from './modules/post/entities/comment-report.entity';
import { RedisModule } from './modules/redis/redis.module';
import { SseModule } from './modules/sse/sse.module';
import { TrackModule } from './modules/track/track.module';
import { UserTrack } from './modules/track/entities/user-track.entity';
import { Tag } from './modules/post/entities/tag.entity';
import { PostTag } from './modules/post/entities/post-tag.entity';
import { ErrorTrack } from './modules/track/entities/error-track.entity';
import { TestModule } from './test/test.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'production'
          ? '.env.production'
          : '.env.development',
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: 3306,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      charset: 'utf8mb4',
      entities: [
        Post,
        User,
        Collection,
        Follow,
        Comment,
        Chat,
        Permission,
        UserPermission,
        ReviewViolationReason,
        PostReport,
        UserLog,
        CommentReport,
        UserTrack,
        ErrorTrack,
        Tag,
        PostTag,
      ],
      namingStrategy: new SnakeNamingStrategy(),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    ...(process.env.NODE_ENV === 'test' ? [TestModule] : []),
    PostModule,
    UserModule,
    AuthModule,
    ChatModule,
    AdminModule,
    RedisModule,
    SseModule,
    TrackModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
