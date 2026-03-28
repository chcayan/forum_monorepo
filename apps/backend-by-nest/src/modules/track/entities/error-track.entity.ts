import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ErrorTrack {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  event!: string;

  @Column()
  userId!: string;

  @Column({ type: 'json' })
  data!: string;

  @Column()
  createdAt!: Date;
}
