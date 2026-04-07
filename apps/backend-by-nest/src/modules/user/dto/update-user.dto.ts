import { Length } from 'class-validator';

export class UpdateUserDto {
  @Length(1, 16)
  username!: string;

  @Length(1, 4)
  sex!: string;

  @Length(1, 30)
  signature!: string;
}
