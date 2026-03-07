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
  content!: string;

  @Column({
    type: 'enum',
    enum: [
      'post_review_pass',
      'post_review_violate',
      'user_mute',
      'user_post_prohibit',
      'user_login_prohibit',
      'system_announcement',
    ],
  })
  status!:
    | 'post_review_pass'
    | 'post_review_violate'
    | 'user_mute'
    | 'user_post_prohibit'
    | 'user_login_prohibit'
    | 'system_announcement';

  @CreateDateColumn()
  createdAt!: Date;

  @Column()
  punishTime!: number;
}
