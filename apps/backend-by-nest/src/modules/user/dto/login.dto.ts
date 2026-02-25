import { IsEmail, Length } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email!: string;

  @Length(6, 16)
  password!: string;
}

export class RegisterDto {
  @IsEmail()
  email!: string;

  @Length(6, 16)
  password!: string;
}
