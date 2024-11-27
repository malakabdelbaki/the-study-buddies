import { IsString, IsEmail, IsEnum } from 'class-validator';
import { Role } from '../../enums/role.enum';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  passwordHash: string;

  @IsEnum(Role)
  role: Role;
}
