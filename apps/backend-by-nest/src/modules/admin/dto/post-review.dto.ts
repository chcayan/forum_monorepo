import { IsInt, IsNotEmpty, IsString, Length } from 'class-validator';

export class PostReviewDto {
  @IsNotEmpty()
  postId!: string;

  @IsNotEmpty()
  @IsInt()
  status!: 1 | 2;

  @IsString()
  @IsNotEmpty({ message: '违规原因不能为空' })
  @Length(1, 255, { message: '违规原因长度必须在 1 到 255 字符之间' })
  reason!: string;

  @IsInt()
  punishTime!: number;
}
