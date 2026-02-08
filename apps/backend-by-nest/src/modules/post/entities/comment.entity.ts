import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('comments')
export class Comment {
  @PrimaryColumn()
  commentId!: string;

  @Column()
  userId!: string;

  @Column()
  pId!: string;

  @Column()
  cContent!: string;

  @Column()
  createdTime!: Date;
}
