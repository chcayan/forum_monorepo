/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';
import { PostAlias, PostFields } from './post.constant';
import { UserAlias, UserFields } from 'src/user/user.constant';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
  ) {}

  create(createPostDto: CreatePostDto) {
    return 'This action adds a new post';
  }

  async find(page: number, pageSize: number) {
    const qb = this.postRepository.createQueryBuilder(PostAlias);
    const [list, total] = await qb
      .leftJoin(PostFields.user, UserAlias)
      .addSelect([UserFields.userAvatar, UserFields.username])
      .orderBy(PostFields.publishTime, 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    const formattedList = list.map(({ user, ...post }) => ({
      ...post,
      username: user?.username,
      userAvatar: user?.userAvatar,
    }));
    // const [list, total] = await this.postRepository.findAndCount({
    //   where: {
    //     isPublic: 'true',
    //   },
    //   order: { publishTime: 'DESC' },
    //   skip: (page - 1) * pageSize,
    //   take: pageSize,
    // });

    return { data: formattedList, total };
  }

  findOne(id: number) {
    return `This action returns a #${id} post`;
  }

  update(id: number, updatePostDto: UpdatePostDto) {
    return `This action updates a #${id} post`;
  }

  remove(id: number) {
    return `This action removes a #${id} post`;
  }
}
