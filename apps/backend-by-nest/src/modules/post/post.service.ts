import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Brackets, Repository } from 'typeorm';
import { PostAlias, PostFields } from './post.constant';
import { UserAlias, UserFields } from 'src/modules/user/user.constant';
import { Comment } from './entities/comment.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
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

    return { postId: nextId };
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
      .andWhere(`${PostFields.status} = :status`, {
        status: 1,
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
      .andWhere(`${PostFields.status} = :status`, {
        status: 1,
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
      .where(`${PostFields.pId} = :pId`, { pId })
      .andWhere(`${PostFields.status} = :status`, {
        status: 1,
      });

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
    const result = await this.postRepository.increment(
      { pId },
      'pViewCount',
      1,
    );

    if (result.affected === 0) {
      throw new NotFoundException('帖子不存在');
    }
  }

  async publishComment(userId: string, postId: string, content: string) {
    const exist = await this.postRepository.findOne({
      where: { pId: postId },
    });

    if (!exist) {
      throw new NotFoundException('未找到该帖子');
    }

    const comment = this.commentRepository.create({
      userId,
      pId: postId,
      cContent: content,
    });

    await this.commentRepository.save(comment);
  }

  async findCommentsByPostId(postId: string) {
    return this.commentRepository
      .createQueryBuilder('c')
      .select([
        'c.comment_id AS commentId',
        'c.user_id AS userId',
        'c.p_id AS pId',
        'c.c_content AS content',
        'c.created_time AS createdTime',
        'u.user_avatar AS userAvatar',
        'u.username AS username',
      ])
      .leftJoin('post', 'p', 'c.p_id = p.p_id')
      .leftJoin('users', 'u', 'c.user_id = u.user_id')
      .where('c.p_id = :postId', { postId })
      .orderBy('c.created_time', 'DESC')
      .getRawMany();
  }
}
