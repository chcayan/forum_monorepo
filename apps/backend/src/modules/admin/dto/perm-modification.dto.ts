import { IsIn, IsString } from 'class-validator';
import type { UserProhibitionType } from '../admin.constant';

export class PermModificationDto {
  @IsString()
  userId!: string;

  @IsIn(['muteUntil', 'postProhibitUntil', 'loginProhibitUntil'])
  prohibition!: UserProhibitionType;

  @IsString()
  reason!: string;
}
