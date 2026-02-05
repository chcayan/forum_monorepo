import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Brackets, Repository } from 'typeorm';
import { PostAlias, PostFields } from './post.constant';
import { UserAlias, UserFields } from 'src/modules/user/user.constant';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
  ) {}

  async create(content: string, isPublic: string, userId: string) {
    const lastPost = await this.postRepository
      .createQueryBuilder(PostAlias)
      .orderBy(PostFields.pId, 'DESC')
      .getOne();

    let nextId = 'p00000';
    if (lastPost) {
      const num = parseInt(lastPost.pId.slice(1)) + 1;
      nextId = `p${num.toString().padStart(5, '0')}`;
    }

    const post = this.postRepository.create({
      pId: nextId,
      pContent: content,
      isPublic: isPublic,
      pImages: [],
      userId: userId,
    });

    await this.postRepository.save(post);
  }

  async addImage(pId: string, imagePath: string) {
    await this.postRepository
      .createQueryBuilder()
      .update(Post)
      .set({
        pImages: () =>
          `JSON_ARRAY_APPEND(IFNULL(p_images, JSON_ARRAY()), '$', '${imagePath}')`,
      })
      .where('p_id = :pId', { pId })
      .execute();
  }

  async find(page: number, pageSize: number) {
    const qb = this.postRepository.createQueryBuilder(PostAlias);
    const [list, total] = await qb
      .leftJoin(PostFields.user, UserAlias)
      .addSelect([UserFields.userAvatar, UserFields.username])
      .where(`${PostFields.isPublic} = :isPublic`, {
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
    // const [list, total] = await this.postRepository.findAndCount({
    //   where: {
    //     isPublic: 'true',
    //   },
    //   order: { publishTime: 'DESC' },
    //   skip: (page - 1) * pageSize,
    //   take: pageSize,
    // });

    return { list: formattedList, total };
  }

  async search(result: string, page: number, pageSize: number) {
    const qb = this.postRepository.createQueryBuilder(PostAlias);
    const [list, total] = await qb
      .leftJoin(PostFields.user, UserAlias)
      .addSelect([UserFields.userAvatar, UserFields.username])
      .where(`${PostFields.isPublic} = :isPublic`, {
        isPublic: 'true',
      })
      .andWhere(`${PostFields.pContent} like :result`, {
        result: `%${result}%`,
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

  async findOne(pId: string, userId: string | null) {
    const qb = this.postRepository.createQueryBuilder(PostAlias);
    qb.leftJoin(PostFields.user, UserAlias)
      .addSelect([UserFields.userAvatar, UserFields.username])
      .where(`${PostFields.pId} = :pId`, { pId });

    // 访问权限控制
    if (userId) {
      qb.andWhere(
        new Brackets((qb) => {
          qb.where(`${PostFields.isPublic} = :isPublic`, {
            isPublic: 'true',
          }).orWhere(`${PostFields.userId} = :userId`, { userId });
        }),
      );
    } else {
      qb.andWhere(`${PostFields.isPublic} = :isPublic`, { isPublic: 'true' });
    }
    const post = await qb.getOne();

    if (!post) throw new NotFoundException('帖子不可见或已删除');

    const { user, ...rest } = post;
    return {
      ...rest,
      userId: user?.userId,
      username: user?.username,
      userAvatar: user?.userAvatar,
    };
  }

  async updateViewCount(pId: string) {
    await this.postRepository.increment({ pId }, 'pViewCount', 1);
  }

  remove(id: number) {
    return `This action removes a #${id} post`;
  }
}
