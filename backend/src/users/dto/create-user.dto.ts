import { IsEmail, IsIn, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  phone: string;

  @IsString()
  @MinLength(11)
  document: string;

  @IsIn(['PF', 'PJ'])
  type: 'PF' | 'PJ';

  @IsString()
  @MinLength(8)
  password: string;
}
