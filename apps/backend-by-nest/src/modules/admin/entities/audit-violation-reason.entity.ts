import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class AuditViolationReason {
  @PrimaryColumn()
  pId!: string;

  @Column()
  reason!: string;

  @Column()
  createdAt!: Date;
}
