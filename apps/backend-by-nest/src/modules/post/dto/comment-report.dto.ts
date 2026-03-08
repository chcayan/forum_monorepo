import { IsInt, IsNotEmpty } from 'class-validator';

export class CommentReportDto {
  @IsNotEmpty()
  @IsInt()
  commentId!: number;

  @IsNotEmpty()
  reason!: string;
}
