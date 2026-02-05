import { Length } from 'class-validator';

export class UpdateUserDto {
  @Length(1, 20)
  username!: string;

  @Length(4)
  sex!: string;

  @Length(6, 20)
  signature!: string;
}
