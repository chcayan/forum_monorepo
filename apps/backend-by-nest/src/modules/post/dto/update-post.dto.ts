import { IsString, Length } from 'class-validator';

export class UpdatePostDto {
  @IsString()
  content!: string;

  @IsString()
  @Length(4, 5)
  isPublic!: string;

  @IsString()
  postId!: string;
}
