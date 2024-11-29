import { IsString, IsNotEmpty, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReplyDto {
  @ApiProperty({ description: 'The ID of the user who created this reply' })
  @IsMongoId()
  @IsNotEmpty()
  user_id: string;


  @ApiProperty({ description: 'The ID of the thread the reply belongs to' })
  @IsMongoId()
  @IsNotEmpty()
  thread_id: string;

  @ApiProperty({ description: 'The content of the reply' })
  @IsString()
  @IsNotEmpty()
  content: string;
}
