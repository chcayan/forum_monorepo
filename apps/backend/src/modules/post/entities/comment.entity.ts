import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('comments')
export class Comment {
  @PrimaryColumn()
  commentId!: number;

  @Column()
  userId!: string;

  @Column()
  pId!: string;

  @Column()
  cContent!: string;

  @Column()
  createdTime!: Date;

  @Column()
  isViolation!: number;
}
