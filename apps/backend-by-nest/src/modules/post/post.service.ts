import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Brackets, In, Repository } from 'typeorm';
import { PostAlias, PostFields } from './post.constant';
import { UserAlias, UserFields } from 'src/modules/user/user.constant';
import { Comment } from './entities/comment.entity';
import { PostReport } from './entities/post-report.entity';
import { CommentReport } from './entities/comment-report.entity';
import { SseService } from '../sse/sse.service';
import { Tag } from './entities/tag.entity';
import { PostTag } from './entities/post-tag.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,

    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,

    @InjectRepository(PostReport)
    private readonly postReportRepository: Repository<PostReport>,

    @InjectRepository(CommentReport)
    private readonly commentReportRepository: Repository<CommentReport>,

    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,

    @InjectRepository(PostTag)
    private readonly postTagRepository: Repository<PostTag>,

    private readonly sseService: SseService,
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

  async modifyPostInfo(
    content: string,
    isPublic: string,
    postId: string,
    userId: string,
  ) {
    const exist = await this.postRepository.findOne({
      where: {
        pId: postId,
        userId,
      },
    });

    if (!exist) {
      throw new NotFoundException('未找到该帖子');
    }

    await this.postRepository.update(
      {
        pId: postId,
      },
      {
        pContent: content,
        isPublic,
        pImages: () => 'JSON_ARRAY()',
        status: 0,
      },
    );

    return { postId };
  }

  async addImage(pId: string, imagePath: string, index: number) {
    await this.postRepository
      .createQueryBuilder()
      .update(Post)
      .set({
        pImages: () => `
        JSON_SET(
          IFNULL(p_images, JSON_ARRAY()),
          '$[${index}]',
          '${imagePath}'
        )
      `,
      })
      .where('p_id = :pId', { pId })
      .execute();
  }

  async find(page: number, pageSize: number) {
    const qb = this.postRepository.createQueryBuilder(PostAlias);
    const [list, total] = await qb
      .leftJoin(PostFields.user, UserAlias)
      .addSelect([UserFields.userAvatar, UserFields.username])
      .leftJoinAndSelect(`${PostFields.tags}`, 'tag')
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

    const formattedList = list.map(({ user, tags, ...post }) => ({
      ...post,
      username: user?.username,
      userAvatar: user?.userAvatar,
      tags: tags?.map((t) => t.name) ?? [],
    }));

    return { list: formattedList, total };
  }

  async search(result: string, page: number, pageSize: number) {
    const qb = this.postRepository.createQueryBuilder(PostAlias);
    const [list, total] = await qb
      .leftJoin(PostFields.user, UserAlias)
      .addSelect([UserFields.userAvatar, UserFields.username])
      .leftJoinAndSelect(`${PostFields.tags}`, 'tag')
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

    const formattedList = list.map(({ user, tags, ...post }) => ({
      ...post,
      username: user?.username,
      userAvatar: user?.userAvatar,
      tags: tags?.map((t) => t.name) ?? [],
    }));

    return { list: formattedList, total };
  }

  async findOne(pId: string, userId: string | null) {
    const qb = this.postRepository.createQueryBuilder(PostAlias);
    qb.leftJoin(PostFields.user, UserAlias)
      .addSelect([UserFields.userAvatar, UserFields.username])
      .leftJoinAndSelect(`${PostFields.tags}`, 'tag')
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

    if (post.status !== 1 && userId !== post.userId)
      throw new NotFoundException('该帖子暂时不可见');

    const { user, tags, ...rest } = post;
    return {
      ...rest,
      userId: rest?.userId,
      username: user?.username,
      userAvatar: user?.userAvatar,
      tags: tags?.map((t) => t.name) ?? [],
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

    if (exist.status !== 1) {
      if (exist.status === 0) {
        throw new ForbiddenException('该帖子审核中');
      }
      if (exist.status === 2) {
        throw new ForbiddenException('该帖子审核未通过');
      }
    }

    const comment = this.commentRepository.create({
      userId,
      pId: postId,
      cContent: content,
    });

    await this.commentRepository.save(comment);

    const post = await this.postRepository.findOne({ where: { pId: postId } });

    if (post && post.userId !== userId) {
      this.sseService.sendMsgToUser(post.userId, {
        type: 'comment',
        message: '刚刚有人评论了你的帖子',
        postId: postId,
      });
    }
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
      .andWhere('c.is_violation = :isViolation', { isViolation: 0 })
      .orderBy('c.created_time', 'DESC')
      .getRawMany();
  }

  async createPostReport(postId: string, reason: string) {
    const exist = await this.postRepository.findOne({
      where: {
        pId: postId,
        status: 1,
      },
    });

    if (!exist) {
      throw new NotFoundException('未找到该帖子或该帖子审核中/审核不通过');
    }

    const _reason = this.postReportRepository.create({
      pId: postId,
      reportReason: reason,
    });

    await this.postReportRepository.save(_reason);
  }

  async createCommentReport(commentId: number, reason: string) {
    const exist = await this.commentRepository.findOne({
      where: { commentId },
    });

    if (!exist) {
      throw new NotFoundException('未找到该评论');
    }

    const _reason = this.commentReportRepository.create({
      commentId,
      reportReason: reason,
    });

    await this.commentReportRepository.save(_reason);
  }

  async findReviewPassIds() {
    const posts = await this.postRepository.find({
      where: { status: 1, isPublic: 'true' },
      select: ['pId'],
    });

    return posts.map((p) => p.pId);
  }

  async bindTagsToPost(postId: string, tagName?: string[]) {
    const post = await this.postRepository.findOne({
      where: { pId: postId },
      relations: ['tags'],
    });

    if (!post) {
      throw new NotFoundException('未找到该帖子');
    }

    if (!tagName || tagName.length === 0) {
      post.tags = [];
      await this.postRepository.save(post);
      return;
    }

    const names = (tagName ?? []).filter(Boolean);

    const existTags = await this.tagRepository.find({
      where: {
        name: In(names),
      },
    });

    const existNames = new Set(existTags.map((t) => t.name));

    const newTags = names
      .filter((name) => !existNames.has(name))
      .map((name) =>
        this.tagRepository.create({
          name,
        }),
      );

    const savedNewTags = await this.tagRepository.save(newTags);

    const allTags = [...existTags, ...savedNewTags];

    // const existingTagIds = new Set(post.tags.map((t) => t.id));

    // const finalTags = [
    //   ...post.tags,
    //   ...allTags.filter((t) => !existingTagIds.has(t.id)),
    // ];

    post.tags = allTags;

    await this.postRepository.save(post);
  }

  async findPostsByTag(tag: string, page: number, pageSize: number) {
    const qb = this.postRepository.createQueryBuilder(PostAlias);
    const [list, total] = await qb
      .leftJoin(PostFields.user, UserAlias)
      .addSelect([UserFields.userAvatar, UserFields.username])
      .leftJoinAndSelect(`${PostFields.tags}`, 'tag')
      .where(`${PostFields.isPublic} = :isPublic`, {
        isPublic: 'true',
      })
      .andWhere('tag.name = :name', {
        name: tag,
      })
      .andWhere(`${PostFields.status} = :status`, {
        status: 1,
      })
      .orderBy(PostFields.publishTime, 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    const formattedList = list.map(({ user, tags, ...post }) => ({
      ...post,
      username: user?.username,
      userAvatar: user?.userAvatar,
      tags: tags?.map((t) => t.name) ?? [],
    }));

    return { list: formattedList, total };
  }
}
