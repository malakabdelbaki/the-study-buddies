import { IsString, IsMongoId } from 'class-validator';
export class UpdateNoteDto {

  @IsMongoId()
  courseId: string;
  @IsMongoId()
  moduleId: string;
  @IsString()
  content: string;
  @IsString()
  title: string;
}