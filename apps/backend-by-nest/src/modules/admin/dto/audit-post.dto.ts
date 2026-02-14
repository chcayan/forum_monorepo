import { IsNotEmpty, IsNumber } from 'class-validator';

export class AuditPostDto {
  @IsNotEmpty()
  postId!: string;

  @IsNotEmpty()
  @IsNumber()
  status!: 0 | 1 | 2;
}
