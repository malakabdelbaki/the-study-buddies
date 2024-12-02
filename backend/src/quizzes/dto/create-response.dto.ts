import { IsString, IsArray, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateResponseDto {
  @IsString()
  user_id: string;

  @Type(() => Object)
  @IsObject({ each: true }) // Ensures each element is an object
  user_answers:{[key:string] : string}; // Array of objects with question_id as key and answer as value
}
