import { IsString, IsArray, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { ExistsOnDatabase } from 'src/common/decorators/exists-on-database.decorator';

export class CreateResponseDto {
  @IsString()
  @ExistsOnDatabase({modelName:'User',column:'_id'})
  user_id: string;

  @Type(() => Object)
  @IsObject({ each: true }) // Ensures each element is an object
  user_answers:{[key:string] : string}; // Array of objects with question_id as key and answer as value
}
