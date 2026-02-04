import { User } from 'src/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

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

  @ManyToOne(() => User, (user) => user.posts)
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'userId',
  })
  user!: User;
}
