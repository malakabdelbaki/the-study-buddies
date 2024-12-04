import { IsString, IsEmail, IsEnum, IsOptional } from 'class-validator';
import { Role } from '../../enums/role.enum';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsEnum(Role)
  role: Role;
  
  @IsOptional()
  @IsString()
  profilePictureUrl?: string;
}
