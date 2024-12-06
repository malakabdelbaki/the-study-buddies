import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsEnum, IsMongoId, IsString } from "class-validator";
import { Types } from "mongoose";
import { Choice } from "src/enums/Choice.enum";
import { Difficulty } from "src/enums/difficulty.enum";
import { QuestionType } from "src/enums/QuestionType.enum";
import { IsValidOptions } from "src/common/validators/Option.validator";
import { ExistsOnDatabase } from "src/common/decorators/exists-on-database.decorator";
export class CreateQuestionDto {
    @ApiProperty({
      description: 'The ID of the module this question belongs to',
      type:  Types.ObjectId,
      example: '64c8e08f5f1d1b001b23f6d5',
    })
    @IsMongoId()
    @ExistsOnDatabase({ modelName: 'Module', column: '_id' })
    module_id: Types.ObjectId; // Foreign key to the Module schema
  
    @ApiProperty({
      description: 'The ID of the instructor who created the question',
      type:  Types.ObjectId,
      example: '64c8e08f5f1d1b001b23f6d5',
    })
    @IsMongoId()
    @ExistsOnDatabase({ modelName: 'User', column: '_id' })
    instructor_id: Types.ObjectId; // Reference to the instructor who created it
  
    @ApiProperty({
      description: 'The text of the question',
      type: String,
      example: 'What is the capital of Egypt?',
    })
    @IsString()
    question: string;
  
    @ApiProperty({
      description: 'The available options for the question in key-value format',
      type: Object,
      example: { a: 'Cairo', b: 'Alexandria', c: 'Giza', d: 'Luxor' },
    })
    @IsValidOptions({ message: 'Options are not valid based on the question type.' })
    options: Record<string, string>; // Adjusted type to key-value format
  
    @ApiProperty({
      description:
        'The correct answer to the question. For MCQ, it should be one of {a, b, c, d}. For True/False, it should be {t, f}.',
      enum: Choice,
      example: 'a',
    })
    @IsEnum(Choice, { message: 'It must be of {a,b,c,d} or {t,f} ' })
    correct_answer: Choice;
  
    @ApiProperty({
      description: 'The difficulty level of the question',
      enum: Difficulty,
      example: 'EASY',
    })
    @IsEnum(Difficulty, { message: 'It must be of difficulty type' })
    difficulty_level: Difficulty;
  
    @ApiProperty({
      description: 'The type of the question',
      enum: QuestionType,
      example: 'MCQ',
    })
    @IsEnum(QuestionType, { message: 'It should be of type Question Type' })
    question_type: QuestionType;
  }