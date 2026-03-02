import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PostReport {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  pId!: string;

  @Column()
  reportReason!: string;

  @Column()
  createdAt!: Date;
}
