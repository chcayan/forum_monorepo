import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class PostTag {
  @PrimaryColumn()
  postId!: string;

  @PrimaryColumn()
  tagId!: number;

  @Column()
  createdAt!: Date;
}
