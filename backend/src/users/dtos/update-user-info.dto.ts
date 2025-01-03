import { IsString, IsOptional } from 'class-validator';

export class UpdateUserInfoDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  profilePicture?: Express.Multer.File;
}