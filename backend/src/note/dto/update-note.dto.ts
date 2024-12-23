import { IsString, IsMongoId } from 'class-validator';
import { ExistsOnDatabase } from 'src/common/decorators/exists-on-database.decorator';
export class UpdateNoteDto {

  @IsString()
  title: string;
  
  @IsString()
  content: string;
  

}