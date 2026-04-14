import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Permission {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  code!: string;

  @Column()
  name!: string;

  @Column({
    type: 'enum',
    enum: ['user', 'admin'],
  })
  scope!: 'user' | 'admin';

  @ManyToMany(() => User, (user) => user.perms)
  users!: User[];
}
