import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class UserLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: string;

  @Column()
  operatorId!: string;

  @Column()
  postId?: string;

  @Column()
  commentId?: number;

  @Column()
  content!: string;

  @Column({
    type: 'enum',
    enum: [
      'post_review_pass', // 帖子审核通过
      'post_review_violate', // 帖子审核未通过
      'post_violate', // 帖子违规（举报）
      'comment_violate', // 评论违规（举报）
      'user_mute', // 用户禁言
      'user_post_prohibit', // 用户禁止发贴
      'user_login_prohibit', // 用户禁止登录
      'system_announcement', // 系统公告
    ],
  })
  status!:
    | 'post_review_pass'
    | 'post_review_violate'
    | 'post_violate'
    | 'comment_violate'
    | 'user_mute'
    | 'user_post_prohibit'
    | 'user_login_prohibit'
    | 'system_announcement';

  @CreateDateColumn()
  createdAt!: Date;

  @Column()
  punishTime!: number;
}
