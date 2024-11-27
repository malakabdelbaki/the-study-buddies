import { IsString, IsOptional } from 'class-validator';

export class CreateQuizDto {

    @IsString()
        module_id: string;

    @IsString()
        user_id: string;

  
}