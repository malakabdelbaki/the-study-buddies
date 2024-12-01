import { IsNotEmpty, IsMongoId, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class UpdateAnnouncementDto {

  @ApiProperty({ example: '60f1b9b3b3f4f00015f2f3b1' })
  @IsNotEmpty()
  @IsMongoId()
  instructor_id: string;

  @ApiProperty({ example: 'This is an announcement' })
  @IsNotEmpty()
  @IsString()
  content: string;
}