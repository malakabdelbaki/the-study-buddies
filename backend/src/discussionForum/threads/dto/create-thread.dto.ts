import { IsNotEmpty, IsString, IsOptional, IsArray } from 'class-validator';
import { Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { ExistsOnDatabase } from 'src/common/decorators/exists-on-database.decorator';

export class CreateThreadDto {
  @ApiProperty({ description: 'The ID of the forum the thread belongs to' })
  @IsNotEmpty()
  @ExistsOnDatabase({ modelName: 'Forum', column: '_id' })
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
  @IsOptional()
  @ExistsOnDatabase({ modelName: 'User', column: '_id' })
  createdBy: Types.ObjectId;
}
