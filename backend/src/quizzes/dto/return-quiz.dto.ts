import { IsString, IsArray, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { Question } from 'src/Models/question.schema';

export class ReturnQuizDto {
  @IsString()
  quiz_id: string;

  @IsString()
  title: string;

  @IsString()
  module_id: string;

  @IsString()
  quiz_type: string;

  @Type(() => String)
  @IsArray()
  questions: Question[];

  @IsString()
  createdBy: string;

  @IsString()
  student_id: string;
}
