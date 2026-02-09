import { IsIn, IsNotEmpty } from 'class-validator';

export class MessageDto {
  @IsNotEmpty()
  from!: string;

  @IsNotEmpty()
  to!: string;

  @IsNotEmpty()
  message!: string;

  @IsIn(['0', '1'])
  isShare!: '0' | '1';
}
