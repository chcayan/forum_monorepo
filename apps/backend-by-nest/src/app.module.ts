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

import { Post } from './modules/post/entities/post.entity';
import { User } from './modules/user/entities/user.entity';
import { Collection } from './modules/user/entities/collection.entity';
import { Follow } from './modules/user/entities/follow.entity';
import { Comment } from './modules/post/entities/comment.entity';
import { Chat } from './modules/chat/entities/chat.entity';

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
      entities: [Post, User, Collection, Follow, Comment, Chat],
      namingStrategy: new SnakeNamingStrategy(),
    }),
    PostModule,
    UserModule,
    AuthModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
