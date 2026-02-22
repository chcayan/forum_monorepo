import { Post } from 'src/modules/post/entities/post.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class Collection {
  @PrimaryColumn()
  userId!: string;

  @PrimaryColumn()
  pId!: string;

  @Column()
  collectTime!: Date;

  @ManyToOne(() => Post)
  @JoinColumn({
    name: 'p_id',
    referencedColumnName: 'pId',
  })
  post!: Post;
}
