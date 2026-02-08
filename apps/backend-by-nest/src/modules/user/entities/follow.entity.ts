import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('follows')
export class Follow {
  @PrimaryColumn()
  userId!: string;

  @PrimaryColumn()
  followId!: string;

  @Column()
  followTime!: Date;
}
