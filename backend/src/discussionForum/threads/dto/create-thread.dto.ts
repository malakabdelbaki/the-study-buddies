import { IsNotEmpty, IsString, IsOptional, IsArray } from 'class-validator';
import { Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export class CreateThreadDto {
  @ApiProperty({ description: 'The ID of the forum the thread belongs to' })
  @IsNotEmpty()
  forumId: Types.ObjectId;
  
  @ApiProperty({ description: 'The title of the thread' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'The content of the thread' })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({ description: 'The ID of the user who created this thread' })
  @IsNotEmpty()
  createdBy: Types.ObjectId;

  @ApiProperty({ description: 'The ID of the forum the thread belongs to' })  
  @IsOptional()
  module?: Types.ObjectId;
}
