import { IsNotEmpty, IsString } from 'class-validator';

export class UserPermissionDto {
  @IsNotEmpty()
  userId!: string;

  @IsNotEmpty()
  permission!: string;

  @IsString()
  reason!: string;
}

export class AdminPermissionDto {
  @IsNotEmpty()
  userId!: string;

  @IsNotEmpty()
  permission!: string;
}
