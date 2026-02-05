import { Post } from 'src/modules/post/entities/post.entity';
import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryColumn()
  userId!: string;

  @Column()
  username!: string;

  @Column()
  userAvatar!: string;

  @Column()
  userEmail!: string;

  @Column({ select: false })
  userPassword!: string;

  @Column()
  registrationTime!: Date;

  @Column()
  follows!: string;

  @Column()
  fans!: string;

  @Column()
  sex!: string;

  @Column()
  signature!: string;

  @Column()
  backgroundImg!: string;

  @OneToMany(() => Post, (post) => post.user)
  posts!: Post[];
}
