import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Collection {
  @PrimaryColumn()
  userId!: string;

  @PrimaryColumn()
  pId!: string;

  @Column()
  collectTime!: Date;
}
