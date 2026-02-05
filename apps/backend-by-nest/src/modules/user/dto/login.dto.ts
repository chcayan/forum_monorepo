import { IsEmail, Length } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email!: string;

  @Length(6, 20)
  password!: string;
}

export class RegisterDto {
  @IsEmail()
  email!: string;

  @Length(6, 20)
  password!: string;
}
