import { Post } from 'src/modules/post/entities/post.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { Permission } from './permission.entity';

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

  @Column()
  userPermMask!: number;

  @Column()
  adminPermMask!: number;

  @Column()
  permVersion!: number;

  @OneToMany(() => Post, (post) => post.user)
  posts!: Post[];

  @ManyToMany(() => Permission, (perm) => perm.users)
  @JoinTable({
    name: 'user_permission',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'userId',
    },
    inverseJoinColumn: {
      name: 'permission_id',
      referencedColumnName: 'id',
    },
  })
  perms!: Permission[];
}
