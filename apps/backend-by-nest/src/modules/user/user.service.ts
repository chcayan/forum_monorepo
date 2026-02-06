import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import bcrypt from 'bcryptjs';

import { User } from './entities/user.entity';
import { Post } from '../post/entities/post.entity';
import { Collection } from './entities/collection.entity';

import { UserAlias, UserFields } from './user.constant';
import { PostAlias, PostFields } from '../post/post.constant';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Post) private readonly postRepository: Repository<Post>,
    @InjectRepository(Collection)
    private readonly collectionRepository: Repository<Collection>,
    private readonly jwtService: JwtService,
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

    const isMatch = await bcrypt.compare(password, user.userPassword);

    if (!isMatch) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const token = this.jwtService.sign({
      id: user.userId,
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
  }

  async findOne(userId: string) {
    const result = await this.userRepository.findOne({
      where: { userId },
    });

    if (!result) throw new NotFoundException('未找到该用户');

    return result;
  }

  async findUserPost(userId: string, page: number, pageSize: number) {
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

  async findUserCollectedPost(
    viewerId: string,
    page: number,
    pageSize: number,
    userId?: string,
  ) {
    console.log(userId);
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

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
