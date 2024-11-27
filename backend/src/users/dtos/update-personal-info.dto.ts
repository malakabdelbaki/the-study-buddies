import { IsString, IsOptional } from 'class-validator';

export class UpdatePersonalInfoDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  profilePictureUrl?: string;
}
