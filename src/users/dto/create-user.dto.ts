import { IsString, IsEmail, IsEnum, MinLength } from 'class-validator';

export enum Role {
  ADMIN = 'ADMIN',
  CASHIER = 'CASHIER'
}

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  username: string;

  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(Role)
  role: Role;
}
