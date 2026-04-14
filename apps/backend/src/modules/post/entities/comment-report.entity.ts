import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Comment } from './comment.entity';

@Entity()
export class CommentReport {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  commentId!: number;

  @Column()
  reportReason!: string;

  @Column()
  createdAt!: Date;

  @ManyToOne(() => Comment)
  @JoinColumn({ name: 'comment_id', referencedColumnName: 'commentId' })
  comment!: Comment;
}
