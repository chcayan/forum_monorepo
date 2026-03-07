import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Post } from './post.entity';

@Entity()
export class PostReport {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  pId!: string;

  @Column()
  reportReason!: string;

  @Column()
  createdAt!: Date;

  @ManyToOne(() => Post)
  @JoinColumn({ name: 'p_id', referencedColumnName: 'pId' })
  post!: Post;
}
