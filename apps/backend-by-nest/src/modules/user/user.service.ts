import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { DataSource, Like, Repository } from 'typeorm';
import bcrypt from 'bcryptjs';

import { User } from './entities/user.entity';
import { Post } from '../post/entities/post.entity';
import { Collection } from './entities/collection.entity';

import { UserAlias, UserFields } from './user.constant';
import { PostAlias, PostFields } from '../post/post.constant';
import { Follow } from './entities/follow.entity';
import { UserPermission } from './entities/user-permission.entity';
import { UserPermissionBit } from '../auth/auth.bit';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Post) private readonly postRepository: Repository<Post>,
    @InjectRepository(Collection)
    private readonly collectionRepository: Repository<Collection>,
    @InjectRepository(Follow)
    private readonly followRepository: Repository<Follow>,
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
  ) {}

  async login(email: string, password: string) {
    const user = await this.userRepository
      .createQueryBuilder(UserAlias)
      .addSelect(UserFields.userPassword)
      .where(`${UserFields.userEmail} = :userEmail`, { userEmail: email })
      .getOne();

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    const userPermMask = user.userPermMask;
    if ((userPermMask & UserPermissionBit.LOGIN) === 0) {
      throw new ForbiddenException('账号封禁中');
    }

    const isMatch = await bcrypt.compare(password, user.userPassword);

    if (!isMatch) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const token = this.jwtService.sign({
      id: user.userId,
      userPermMask: user.userPermMask,
      adminPermMask: user.adminPermMask,
      permVersion: user.permVersion,
    });

    return { token };
  }

  async register(email: string, password: string) {
    const user = await this.userRepository.findOne({
      where: { userEmail: email },
    });

    if (user) {
      throw new ConflictException('该邮箱已被注册');
    }

    const [lastUser] = await this.userRepository.find({
      select: ['userId'],
      order: { userId: 'DESC' },
      take: 1,
    });

    const nextId = lastUser
      ? `u${(parseInt(lastUser.userId.slice(1)) + 1)
          .toString()
          .padStart(5, '0')}`
      : 'u00000';

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = this.userRepository.create({
      userId: nextId,
      username: '默认名字',
      userEmail: email,
      userPassword: hashedPassword,
    });

    await this.userRepository.save(newUser);

    const permIds = [1, 2, 3];

    await this.dataSource.transaction(async (manager) => {
      const userPermissions = permIds.map((id) =>
        manager.create(UserPermission, {
          userId: nextId,
          permissionId: id,
        }),
      );

      await manager.insert(UserPermission, userPermissions);
    });
  }

  async findOne(userId: string) {
    const result = await this.userRepository.findOne({
      where: { userId },
    });

    if (!result) throw new NotFoundException('未找到该用户');

    return result;
  }

  async findUserPostByUserId(userId: string, page: number, pageSize: number) {
    const qb = this.postRepository.createQueryBuilder(PostAlias);
    const [list, total] = await qb
      .leftJoin(PostFields.user, UserAlias)
      .addSelect([UserFields.userAvatar, UserFields.username])
      .where(`${PostFields.userId} = :userId`, {
        userId: userId,
      })
      .andWhere(`${PostFields.isPublic} = :isPublic`, {
        isPublic: 'true',
      })
      .orderBy(PostFields.publishTime, 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    const formattedList = list.map(({ user, ...post }) => ({
      ...post,
      username: user?.username,
      userAvatar: user?.userAvatar,
    }));

    return { list: formattedList, total };
  }

  async findCollectedPostByViewerId(
    viewerId: string,
    page: number,
    pageSize: number,
    userId?: string,
  ) {
    const qb = this.collectionRepository
      .createQueryBuilder('c')
      .leftJoin('post', 'p', 'c.p_id = p.p_id')
      .leftJoin('users', 'u', 'p.user_id = u.user_id')
      .leftJoin(
        'collection',
        'c2',
        'c2.p_id = c.p_id AND c2.user_id = :userId',
        { userId },
      )
      .where('c.user_id = :viewerId', { viewerId })
      .andWhere('(p.is_public = :isPublic OR p.user_id = :userId)', {
        isPublic: 'true',
        userId,
      })
      .select([
        'p.p_id AS p_id',
        'p.user_id AS user_id',
        'p.p_view_count AS p_view_count',
        'p.p_collect_count AS p_collect_count',
        'p.p_share_count AS p_share_count',
        'p.p_comment_count AS p_comment_count',
        'p.p_content AS p_content',
        'p.p_images AS p_images',
        'p.is_public AS is_public',
        'p.publish_time AS publish_time',
        'u.user_avatar AS user_avatar',
        'u.username AS username',
      ])
      .orderBy('c.collect_time', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const list = await qb.getRawMany();

    const total = await this.collectionRepository
      .createQueryBuilder('c')
      .leftJoin('post', 'p', 'c.p_id = p.p_id')
      .leftJoin(
        'collection',
        'c2',
        'c2.p_id = c.p_id AND c2.user_id = :userId',
        { userId },
      )
      .where('c.user_id = :viewerId', { viewerId })
      .andWhere('(p.is_public = :isPublic OR p.user_id = :userId)', {
        isPublic: 'true',
        userId,
      })
      .getCount();

    return { list, total };
  }

  async findCollectedPostIdsByViewerId(userId: string) {
    const rows: { p_id: string }[] = (await this.collectionRepository
      .createQueryBuilder('c')
      .select('c.p_id', 'p_id')
      .innerJoin('post', 'p', 'p.p_id = c.p_id')
      .where('c.user_id = :userId', { userId })
      .andWhere('(p.is_public = :isPublic OR p.user_id = :userId)', {
        isPublic: 'true',
        userId,
      })
      .getRawMany()) as unknown as { p_id: string }[];

    return rows.map((item) => item.p_id);
  }

  async addCollect(userId: string, postId: string) {
    const existPost = await this.postRepository.findOne({
      where: { pId: postId },
    });

    if (!existPost) {
      throw new NotFoundException('未找到该帖子');
    }

    const existCollect = await this.collectionRepository.findOne({
      where: { userId, pId: postId },
    });

    if (existCollect) {
      throw new ConflictException('已收藏');
    }

    const collection = this.collectionRepository.create({
      userId,
      pId: postId,
    });

    await this.collectionRepository.save(collection);
  }

  async delCollect(userId: string, postId: string) {
    const existPost = await this.postRepository.findOne({
      where: { pId: postId },
    });

    if (!existPost) {
      throw new NotFoundException('未找到该帖子');
    }

    const existCollect = await this.collectionRepository.findOne({
      where: { userId, pId: postId },
    });

    if (!existCollect) {
      throw new ConflictException('未收藏');
    }

    await this.collectionRepository.delete({
      userId,
      pId: postId,
    });
  }

  async delPost(userId: string, postId: string) {
    const existPost = await this.postRepository.findOne({
      where: { userId, pId: postId },
    });

    if (!existPost) {
      throw new NotFoundException('未找到该帖子');
    }

    await this.postRepository.delete({
      userId,
      pId: postId,
    });
  }

  async setPostPublic(userId: string, postId: string) {
    const existPost = await this.postRepository.findOne({
      where: { userId, pId: postId },
    });

    if (!existPost) {
      throw new NotFoundException('未找到该帖子');
    }

    await this.postRepository.update(
      { pId: postId, userId },
      { isPublic: 'true' },
    );
  }

  async setPostPrivate(userId: string, postId: string) {
    const existPost = await this.postRepository.findOne({
      where: { userId, pId: postId },
    });

    if (!existPost) {
      throw new NotFoundException('未找到该帖子');
    }

    await this.postRepository.update(
      { pId: postId, userId },
      { isPublic: 'false' },
    );
  }

  async findUserFriend(userId: string) {
    return this.followRepository
      .createQueryBuilder('f1')
      .select([
        'f1.userId AS userId',
        'f1.followId AS followId',
        'u.username AS username',
        'u.userAvatar AS userAvatar',
      ])
      .innerJoin(
        'follows',
        'f2',
        'f1.followId = f2.userId AND f2.followId = :userId',
        { userId },
      )
      .leftJoin('users', 'u', 'f1.followId = u.userId')
      .where('f1.userId = :userId', { userId })
      .getRawMany();
  }

  async addFollow(userId: string, followId: string) {
    const existUser = await this.userRepository.findOne({
      where: { userId: followId },
    });

    if (!existUser) {
      throw new NotFoundException('未找到该用户');
    }

    const existFollow = await this.followRepository.findOne({
      where: { userId, followId },
    });

    if (existFollow) {
      throw new ConflictException('已关注');
    }

    const follow = this.followRepository.create({
      userId,
      followId,
    });

    await this.followRepository.save(follow);
  }

  async delFollow(userId: string, followId: string) {
    const existUser = await this.userRepository.findOne({
      where: { userId: followId },
    });

    if (!existUser) {
      throw new NotFoundException('未找到该用户');
    }

    const existFollow = await this.followRepository.findOne({
      where: { userId, followId },
    });

    if (!existFollow) {
      throw new ConflictException('未关注');
    }

    await this.followRepository.delete({
      userId,
      followId,
    });
  }

  async search(keyword: string) {
    return this.userRepository.find({
      select: {
        userId: true,
        username: true,
        userAvatar: true,
      },
      where: {
        username: Like(`%${keyword}%`),
      },
    });
  }

  async findUserFollows(userId: string) {
    return this.followRepository
      .createQueryBuilder('f')
      .select([
        'f.user_id AS userId',
        'f.follow_id AS followId',
        'u.username AS username',
        'u.user_avatar AS userAvatar',
      ])
      .leftJoin('users', 'u', 'f.follow_id = u.user_id')
      .where('f.user_id = :userId', { userId })
      .getRawMany();
  }

  async findUserFans(userId: string) {
    return this.followRepository
      .createQueryBuilder('f')
      .select([
        'f.user_id AS userId',
        'f.follow_id AS followId',
        'u.username AS username',
        'u.user_avatar AS userAvatar',
      ])
      .leftJoin('users', 'u', 'f.user_id = u.user_id')
      .where('f.follow_id = :userId', { userId })
      .getRawMany();
  }

  async update(
    userId: string,
    username: string,
    sex: string,
    signature: string,
    files?: {
      avatar?: Express.Multer.File[];
      bgImg?: Express.Multer.File[];
    },
  ) {
    const updateData: Partial<User> = {
      username,
      sex,
      signature,
    };

    if (files?.avatar?.[0]) {
      updateData.userAvatar = `/uploads/${files.avatar[0].filename}`;
    }

    if (files?.bgImg?.[0]) {
      updateData.backgroundImg = `/uploads/${files.bgImg[0].filename}`;
    }

    await this.userRepository.update({ userId }, updateData);
  }
}
