import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserPermission } from '../user/entities/user-permission.entity';
import { Repository } from 'typeorm';
import {
  AdminPermissionCodeToIdMap,
  UserPermissionCodeToIdMap,
} from '../auth/auth.map';
import { AuthService } from '../auth/auth.service';
import { User } from '../user/entities/user.entity';
import { Post } from '../post/entities/post.entity';
import { UserAlias, UserFields } from '../user/user.constant';
import { AdminPermissionBit, UserPermissionBit } from '../auth/auth.bit';
import bcrypt from 'bcryptjs';
import { AdminPerm } from 'src/common/constant/permission.constant';
import { PostAlias, PostFields } from '../post/post.constant';
import { ReviewViolationReason } from './entities/review-violation-reason.entity';
import { PostReport } from '../post/entities/post-report.entity';
import { UserLogStatusType, UserProhibitionType } from './admin.constant';
import { UserLog } from './entities/user-log.entity';
import { CommentReport } from '../post/entities/comment-report.entity';
import { Comment } from '../post/entities/comment.entity';
import { formatRemainTime } from 'src/common/utils/date.utils';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(UserPermission)
    private readonly userPermissionRepository: Repository<UserPermission>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Post) private readonly postRepository: Repository<Post>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(ReviewViolationReason)
    private readonly reviewViolationReasonRepository: Repository<ReviewViolationReason>,
    @InjectRepository(PostReport)
    private readonly postReportRepository: Repository<PostReport>,
    @InjectRepository(CommentReport)
    private readonly commentReportRepository: Repository<CommentReport>,
    @InjectRepository(UserLog)
    private readonly userLogRepository: Repository<UserLog>,
    private readonly authService: AuthService,
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
    const adminPermMask = user.adminPermMask;

    const isMatch = await bcrypt.compare(password, user.userPassword);

    if (!isMatch) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    if ((userPermMask & UserPermissionBit.LOGIN) === 0) {
      throw new ForbiddenException('账号永久封禁中');
    }

    if (adminPermMask === 0) {
      throw new ForbiddenException('该用户没有管理员权限，请联系管理员');
    }

    // const permissions = this.createPermissionsObj(userPermMask, adminPermMask);

    return user.userId;
  }

  createPermissionsObj(userPermMask: number, adminPermMask: number) {
    // const userPermission: string[] = [];
    const adminPermission: string[] = [];

    // if ((userPermMask & UserPermissionBit.SPEAK) !== 0) {
    //   userPermission.push(UserPerm.user_speak);
    // }

    // if ((userPermMask & UserPermissionBit.POST) !== 0) {
    //   userPermission.push(UserPerm.user_post);
    // }

    // if ((userPermMask & UserPermissionBit.LOGIN) !== 0) {
    //   userPermission.push(UserPerm.user_login);
    // }

    if ((adminPermMask & AdminPermissionBit.POST_REVIEW) !== 0) {
      adminPermission.push(AdminPerm.post_review);
    }

    if ((adminPermMask & AdminPermissionBit.REPORT_REVIEW) !== 0) {
      adminPermission.push(AdminPerm.report_review);
    }

    if ((adminPermMask & AdminPermissionBit.USER_PERM_MODIFY) !== 0) {
      adminPermission.push(AdminPerm.user_perm_modify);
    }

    // return {
    //   user: userPermission,
    //   admin: adminPermission,
    // };

    return adminPermission;
  }

  async findOne(userId: string) {
    const result = await this.userRepository.findOne({
      where: { userId },
    });

    if (!result) throw new NotFoundException('未找到该用户');

    const userPermMask = result.userPermMask;
    const adminPermMask = result.adminPermMask;

    const permissions = this.createPermissionsObj(userPermMask, adminPermMask);

    return {
      userId: result.userId,
      username: result.username,
      userAvatar: result.userAvatar,
      userEmail: result.userEmail,
      permissions,
    };
  }

  async addUserPermission(userId: string, permission: string) {
    const user = await this.userRepository.findOne({
      where: {
        userId,
      },
    });
    if (!user) throw new BadRequestException('未找到该用户');

    if (user.userId === 'u00000') {
      throw new ForbiddenException('不允许修改默认管理员');
    }

    if (!(permission in UserPermissionCodeToIdMap)) {
      throw new BadRequestException('非法权限码');
    }

    const up = this.userPermissionRepository.create({
      userId,
      permissionId: UserPermissionCodeToIdMap[permission]!,
    });

    await this.userPermissionRepository.save(up);

    await this.authService.recalcUserPermission(userId);
  }

  async delUserPermission(userId: string, permission: string) {
    const user = await this.userRepository.findOne({
      where: {
        userId,
      },
    });
    if (!user) throw new BadRequestException('未找到该用户');

    if (user.userId === 'u00000') {
      throw new ForbiddenException('不允许修改默认管理员');
    }

    if (!(permission in UserPermissionCodeToIdMap)) {
      throw new BadRequestException('非法权限码');
    }

    await this.userPermissionRepository.delete({
      userId,
      permissionId: UserPermissionCodeToIdMap[permission]!,
    });

    await this.authService.recalcUserPermission(userId);
  }

  async addAdminPermission(userId: string, permission: string) {
    const user = await this.userRepository.findOne({
      where: {
        userId,
      },
    });
    if (!user) throw new BadRequestException('未找到该用户');

    if (user.userId === 'u00000') {
      throw new ForbiddenException('不允许修改默认管理员');
    }

    if (!(permission in AdminPermissionCodeToIdMap)) {
      throw new BadRequestException('非法权限码');
    }

    const up = this.userPermissionRepository.create({
      userId,
      permissionId: AdminPermissionCodeToIdMap[permission]!,
    });

    await this.userPermissionRepository.save(up);

    await this.authService.recalcUserPermission(userId);
  }

  async delAdminPermission(userId: string, permission: string) {
    const user = await this.userRepository.findOne({
      where: {
        userId,
      },
    });
    if (!user) throw new BadRequestException('未找到该用户');

    if (user.userId === 'u00000') {
      throw new ForbiddenException('不允许修改默认管理员');
    }

    if (!(permission in AdminPermissionCodeToIdMap)) {
      throw new BadRequestException('非法权限码');
    }

    await this.userPermissionRepository.delete({
      userId,
      permissionId: AdminPermissionCodeToIdMap[permission]!,
    });

    await this.authService.recalcUserPermission(userId);
  }

  async reviewPost(postId: string, status: 0 | 1 | 2) {
    const existPost = await this.postRepository.findOne({
      where: { pId: postId },
    });

    if (!existPost) {
      throw new NotFoundException('未找到该帖子');
    }

    await this.postRepository.update({ pId: postId }, { status });
  }

  async findUnreviewPost(page: number, pageSize: number) {
    const qb = this.postRepository.createQueryBuilder(PostAlias);
    const [list, total] = await qb
      .leftJoin(PostFields.user, UserAlias)
      .addSelect([UserFields.userAvatar, UserFields.username])
      .where(`${PostFields.status} = :status`, {
        status: 0,
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

  async setCommentViolate(commentId: number) {
    await this.commentRepository.update({ commentId }, { isViolation: 1 });
  }

  async createViolationReason(postId: string, reason: string) {
    const exist = await this.reviewViolationReasonRepository.findOne({
      where: { pId: postId },
    });

    if (exist) {
      await this.reviewViolationReasonRepository.update(
        {
          pId: postId,
        },
        {
          reason,
        },
      );
    } else {
      const _reason = this.reviewViolationReasonRepository.create({
        pId: postId,
        reason: reason,
      });

      await this.reviewViolationReasonRepository.save(_reason);
    }
  }

  async findPostReports(page: number, pageSize: number) {
    const qb = this.postReportRepository.createQueryBuilder('pr');

    const [list, total] = await qb
      .leftJoinAndSelect('pr.post', 'p')
      .orderBy('pr.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    const formatted = list.map(({ post, ...rest }) => ({
      ...rest,
      userId: post.userId,
    }));

    const grouped = Object.values(
      formatted.reduce(
        (acc, item) => {
          if (!acc[item.pId]) {
            acc[item.pId] = {
              postId: item.pId,
              userId: item.userId,
              reasons: [],
            };
          }
          acc[item.pId]!.reasons.push(item.reportReason);

          return acc;
        },
        {} as Record<
          string,
          { postId: string; userId: string; reasons: string[] }
        >,
      ),
    );

    return { list: grouped, total };
  }

  async findCommentReports(page: number, pageSize: number) {
    const qb = this.commentReportRepository.createQueryBuilder('cr');

    const [list, total] = await qb
      .leftJoinAndSelect('cr.comment', 'c')
      .orderBy('cr.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    const formatted = list.map(({ comment, ...rest }) => ({
      ...rest,
      userId: comment.userId,
      postId: comment.pId,
    }));

    const grouped = Object.values(
      formatted.reduce(
        (acc, item) => {
          if (!acc[item.commentId]) {
            acc[item.commentId] = {
              postId: item.postId,
              commentId: item.commentId,
              userId: item.userId,
              reasons: [],
            };
          }
          acc[item.commentId]!.reasons.push(item.reportReason);

          return acc;
        },
        {} as Record<
          string,
          {
            postId: string;
            commentId: number;
            userId: string;
            reasons: string[];
          }
        >,
      ),
    );

    return { list: grouped, total };
  }

  async deletePostReport(postId: string) {
    const res = await this.postReportRepository.delete({ pId: postId });

    if (res.affected === 0) {
      throw new NotFoundException('未找到该举报信息');
    }
  }

  async deleteCommentReport(commentId: number) {
    const res = await this.commentReportRepository.delete({ commentId });

    if (res.affected === 0) {
      throw new NotFoundException('未找到该举报信息');
    }
  }

  async setUserProhibition(
    userId: string,
    prohibition: UserProhibitionType,
    hours: number,
  ) {
    if (hours < 1) {
      throw new BadRequestException('禁言天数必须大于 1h');
    }

    const user = await this.userRepository.findOne({
      where: { userId },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    if (
      prohibition !== 'muteUntil' &&
      prohibition !== 'loginProhibitUntil' &&
      prohibition !== 'postProhibitUntil'
    ) {
      throw new NotFoundException('未找到该权限');
    }

    const now = new Date();
    const until = new Date(now);
    until.setHours(now.getHours() + hours);

    await this.userRepository.update(userId, {
      [`${prohibition}`]: until,
    });

    return {
      message: `已限制${hours}小时`,
    };
  }

  async setUserLog(
    userId: string,
    operatorId: string,
    content: string,
    status: UserLogStatusType,
    punishTime: number,
    postId?: string,
    commentId?: number,
  ) {
    let log: UserLog;
    if (postId && commentId) {
      log = this.userLogRepository.create({
        userId,
        operatorId,
        content,
        status,
        punishTime,
        postId,
        commentId,
      });
    } else if (postId) {
      log = this.userLogRepository.create({
        userId,
        operatorId,
        content,
        status,
        punishTime,
        postId,
      });
    } else {
      log = this.userLogRepository.create({
        userId,
        operatorId,
        content,
        status,
        punishTime,
      });
    }

    await this.userLogRepository.save(log);
  }

  async findUserIdByPostId(postId: string) {
    const post = await this.postRepository.findOne({
      where: { pId: postId },
    });

    const userId = post?.userId;

    return userId;
  }

  async getUserPerms(page: number, pageSize: number) {
    const qb = this.userRepository.createQueryBuilder('user');

    const [list, total] = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    const filteredList = list.map((user) => ({
      userId: user.userId,
      username: user.username,
      avatar: user.userAvatar,
      email: user.userEmail,
      hasUserSpeakPerm: (user.userPermMask & UserPermissionBit.SPEAK) === 1,
      hasUserPostPerm: (user.userPermMask & UserPermissionBit.POST) === 2,
      hasUserLoginPerm: (user.userPermMask & UserPermissionBit.LOGIN) === 4,
      hasPostReviewPerm:
        (user.adminPermMask & AdminPermissionBit.POST_REVIEW) === 1,
      hasReportReviewPerm:
        (user.adminPermMask & AdminPermissionBit.REPORT_REVIEW) === 2,
      hasUserPermModifyPerm:
        (user.adminPermMask & AdminPermissionBit.USER_PERM_MODIFY) === 4,
      muteUntil: formatRemainTime(user.muteUntil),
      postProhibitUntil: formatRemainTime(user.postProhibitUntil),
      loginProhibitUntil: formatRemainTime(user.loginProhibitUntil),
    }));

    return { list: filteredList, total };
  }
}
