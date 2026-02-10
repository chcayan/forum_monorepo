import { Entity, PrimaryColumn } from 'typeorm';

@Entity('user_permission')
export class UserPermission {
  @PrimaryColumn()
  userId!: string;

  @PrimaryColumn()
  permissionId!: number;
}
