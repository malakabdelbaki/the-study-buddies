import { IsString, IsMongoId } from 'class-validator';
import { ExistsOnDatabase } from 'src/common/decorators/exists-on-database.decorator';
export class UpdateNoteDto {

  @IsMongoId()
  @ExistsOnDatabase({ modelName: 'Course', column: '_id' })
  courseId: string;

  @IsMongoId()
  @ExistsOnDatabase({ modelName: 'Module', column: '_id' })
  moduleId: string;

  @IsString()
  content: string;
  
  @IsString()
  title: string;
}