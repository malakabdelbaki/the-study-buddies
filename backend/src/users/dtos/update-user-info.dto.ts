import { IsString, IsOptional } from 'class-validator';

export class UpdateUserInfoDto {
  @IsOptional()
  @IsString()
  name?: string;
  
  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  profilePictureUrl?: string;
}
