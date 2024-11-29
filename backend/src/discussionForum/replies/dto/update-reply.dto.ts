import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateReplyDto {
  @ApiProperty({ description: 'The content of the reply' })
  @IsString()
  @IsOptional()
  content?: string;
}
