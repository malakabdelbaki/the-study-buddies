import { IsString, IsArray, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { Question } from 'src/Models/question.schema';
import { Answer } from 'src/Models/answer.schema';

export class ReturnResponseDto {
  @IsString()
  user_id: string;

  @IsString()
  user_name: string;

  @IsString()
  quiz_id: string;

  @IsString()
  quiz_title: string;

  @Type(() => Answer)
  @IsArray()
  answers: Answer[];

  @IsNumber()
  score: number;

  @Type(() => Question)
  @IsArray()
  questions: Question[];
}
