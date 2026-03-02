import { IsNotEmpty } from 'class-validator';

export class ReportDto {
  @IsNotEmpty()
  postId!: string;

  @IsNotEmpty()
  reason!: string;
}
