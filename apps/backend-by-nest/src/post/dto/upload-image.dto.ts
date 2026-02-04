import { IsString } from 'class-validator';

export class UploadImageDto {
  @IsString()
  pId!: string;
}
