import { ApiProperty, PartialType } from "@nestjs/swagger";
import { CreateModuleDto } from "./create-module.dto";
import { IsMongoId, IsString, IsArray, IsEnum, IsOptional } from "class-validator";
import { Types } from "mongoose";
import { IsValidOptions } from "src/common/validators/Option.validator";
import { Choice } from "src/enums/Choice.enum";
import { Difficulty } from "src/enums/difficulty.enum";
import { QuestionType } from "src/enums/QuestionType.enum";

export class UpdateQuestionDto extends PartialType(CreateModuleDto){

      @ApiProperty({
        description: 'The text of the question',
        type: String,
        example: 'What is the capital of Egypt?',
      })
      @IsString()
      @IsOptional()
      question?: string;
    
      @ApiProperty({
        description: 'The available options for the question in key-value format',
        type: Object,
        example: { a: 'Cairo', b: 'Alexandria', c: 'Giza', d: 'Luxor' },
      })
      @IsValidOptions({ message: 'Options are not valid based on the question type.' })
      @IsOptional()
      options?: Record<string, string>; // Adjusted type to key-value format
    

      @ApiProperty({
        description:
          'The correct answer to the question. For MCQ, it should be one of {a, b, c, d}. For True/False, it should be {t, f}.',
        enum: Choice,
        example: 'a',
      })
      @IsOptional()
      @IsEnum(Choice, { message: 'It must be of {a,b,c,d} or {t,f} ' })
      correct_answer?: Choice;
    
      @ApiProperty({
        description: 'The difficulty level of the question',
        enum: Difficulty,
        example: 'EASY',
      })
      @IsEnum(Difficulty, { message: 'It must be of difficulty type' })
      @IsOptional()
      difficulty_level?: Difficulty;
}