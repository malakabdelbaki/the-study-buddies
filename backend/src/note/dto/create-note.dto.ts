import { Type } from '@nestjs/common';
import { IsString, IsMongoId, IsNotEmpty } from 'class-validator';
import { ExistsOnDatabase } from 'src/common/decorators/exists-on-database.decorator';
import { Types } from 'mongoose';
import { IsNoteEnabled } from 'src/common/validators/notes-enabled.validator';
export class CreateNoteDto {

  @IsMongoId()
  @IsNotEmpty()
  @ExistsOnDatabase({ modelName: 'Course', column: '_id' })
 @IsNoteEnabled()
  course_id: Types.ObjectId;

  @IsMongoId()
  @IsNotEmpty()
  @ExistsOnDatabase({ modelName: 'Module', column: '_id' })
  module_id: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  content: string;
  
  @IsString()
  @IsNotEmpty()
  title: string;
}