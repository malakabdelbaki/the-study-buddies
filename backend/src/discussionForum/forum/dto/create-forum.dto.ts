import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';
import { Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
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
  @Transform(({ value }) => new Types.ObjectId(value))
  @ExistsOnDatabase({ modelName: 'Course', column: '_id' })
  course_id: Types.ObjectId;

  @ApiProperty({ description: 'The ID of the user who created the forum' })
  @Transform(({ value }) => new Types.ObjectId(value))
  @ExistsOnDatabase({ modelName: 'User', column: '_id' })
  created_by: Types.ObjectId;

  @ApiProperty({ description: 'The active status of the forum', default: true })
  @IsBoolean()
  is_active?: boolean = true;
}
