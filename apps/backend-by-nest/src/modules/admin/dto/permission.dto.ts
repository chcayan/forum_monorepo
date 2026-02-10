import { IsNotEmpty } from 'class-validator';

export class PermissionDto {
  @IsNotEmpty()
  userId!: string;

  @IsNotEmpty()
  permission!: string;
}
