import { IsString, IsNotEmpty, IsMongoId } from 'class-validator';

export class ChangePasswordDto {
  
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}
