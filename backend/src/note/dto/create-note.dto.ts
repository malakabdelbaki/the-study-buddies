import { IsString, IsMongoId } from 'class-validator';
export class CreateNoteDto {

  @IsMongoId()
  courseId: string;

  @IsMongoId()
  moduleId: string;

  @IsString()
  content: string;
  
  @IsString()
  title: string;
}