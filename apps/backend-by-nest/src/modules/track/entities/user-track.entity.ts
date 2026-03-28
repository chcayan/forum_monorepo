import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserTrack {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  event!: string;

  @Column()
  userId!: string;

  @Column()
  page!: string;

  @Column({ type: 'json' })
  data!: string;

  @Column()
  createdAt!: Date;
}
