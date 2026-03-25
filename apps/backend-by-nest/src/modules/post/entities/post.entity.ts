import { User } from 'src/modules/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Tag } from './tag.entity';

@Entity()
export class Post {
  @PrimaryColumn()
  pId!: string;

  @Column()
  userId!: string;

  @Column()
  pViewCount!: string;

  @Column()
  pCollectCount!: string;

  @Column()
  pShareCount!: string;

  @Column()
  pCommentCount!: string;

  @Column()
  pContent!: string;

  @Column({ type: 'json', default: '[]' })
  pImages!: string[];

  @Column()
  publishTime!: Date;

  @Column()
  isPublic!: string;

  // 未审核: 0; 审核通过: 1; 审核未通过: 2
  @Column()
  status!: 0 | 1 | 2;

  @ManyToOne(() => User, (user) => user.posts)
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'userId',
  })
  user!: User;

  @ManyToMany(() => Tag, (tag) => tag.posts, {
    cascade: false,
  })
  @JoinTable({
    name: 'post_tag',
    joinColumn: {
      name: 'post_id',
      referencedColumnName: 'pId',
    },
    inverseJoinColumn: {
      name: 'tag_id',
      referencedColumnName: 'id',
    },
  })
  tags!: Tag[];
}
