import { IsString, Length } from 'class-validator';

export class CreatePostDto {
  @IsString()
  content!: string;

  @IsString()
  @Length(4, 5)
  isPublic!: string;
}
