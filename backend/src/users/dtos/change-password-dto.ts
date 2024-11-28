import { IsString, IsNotEmpty, IsMongoId } from 'class-validator';

export class ChangePasswordDto {
  // @IsMongoId()
  // @IsNotEmpty()
  // userId: string;

  @IsString()
  @IsNotEmpty()
  newPassword: string;
}
