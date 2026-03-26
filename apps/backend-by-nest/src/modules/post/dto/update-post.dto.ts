import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdatePostDto {
  @IsString()
  content!: string;

  @IsString()
  @Length(4, 5)
  isPublic!: string;

  @IsString()
  postId!: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MinLength(1, { each: true })
  @MaxLength(20, { each: true })
  @IsNotEmpty({ each: true })
  @Transform(({ value }: { value: string[] }) =>
    value.map((v: string) => v.trim()),
  )
  tags?: string[];
}
