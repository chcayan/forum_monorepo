import { IsNotEmpty } from 'class-validator';

export class PostReportDto {
  @IsNotEmpty()
  postId!: string;

  @IsNotEmpty()
  reason!: string;
}
