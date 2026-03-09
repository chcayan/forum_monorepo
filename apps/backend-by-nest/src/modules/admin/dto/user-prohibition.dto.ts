import { IsIn, IsInt, IsNumber, IsString } from 'class-validator';
import type { UserProhibitionType } from '../admin.constant';

export class UserProhibitionDto {
  @IsString()
  userId!: string;

  @IsIn(['muteUntil', 'postProhibitUntil', 'loginProhibitUntil'])
  prohibition!: UserProhibitionType;

  @IsString()
  reason!: string;

  @IsString()
  postId!: string;

  @IsNumber()
  commentId?: number;

  @IsInt()
  hours!: number;

  @IsInt()
  punishTime!: number;
}
