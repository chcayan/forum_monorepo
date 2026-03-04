import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class ReviewViolationReason {
  @PrimaryColumn()
  pId!: string;

  @Column()
  reason!: string;

  @Column()
  createdAt!: Date;
}
