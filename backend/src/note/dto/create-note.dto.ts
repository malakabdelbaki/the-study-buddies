import { Type } from '@nestjs/common';
import { IsString, IsMongoId, IsNotEmpty } from 'class-validator';
import { ExistsOnDatabase } from 'src/common/decorators/exists-on-database.decorator';
import { Types } from 'mongoose';
export class CreateNoteDto {

  @IsMongoId()
  @IsNotEmpty()
  @ExistsOnDatabase({ modelName: 'Course', column: '_id' })
  courseId: Types.ObjectId;

  @IsMongoId()
  @IsNotEmpty()
  @ExistsOnDatabase({ modelName: 'Module', column: '_id' })
  moduleId: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  content: string;
  
  @IsString()
  @IsNotEmpty()
  title: string;
}