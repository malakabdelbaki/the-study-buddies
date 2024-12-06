import { IsString, IsNotEmpty, IsBoolean } from 'class-validator';
import { Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { ExistsOnDatabase } from 'src/common/decorators/exists-on-database.decorator';


export class CreateForumDto {
  @ApiProperty({ description: 'The title of the forum' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'The description of the forum' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'The ID of the course associated with this forum' })
  @IsString()
  @IsNotEmpty()
  @ExistsOnDatabase({ modelName: 'Course', column: '_id' })
  course_id: Types.ObjectId;

  @ApiProperty({ description: 'The ID of the user who created this forum' })
  @IsString()
  @IsNotEmpty()
  @ExistsOnDatabase({ modelName: 'User', column: '_id' })
  created_by: Types.ObjectId;

  @ApiProperty({ description: 'The active status of the forum', default: true })
  @IsBoolean()
  is_active?: boolean = true;
}
