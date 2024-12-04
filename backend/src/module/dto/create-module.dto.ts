import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { Difficulty } from 'src/enums/difficulty.enum';
import { QuizType } from 'src/enums/QuizType.enum';

export class CreateModuleDto {
  @ApiProperty({
    description: 'ID of the associated course',
    example: '64a1234f7d9b5f001f123456',
  })
  @IsMongoId()
  course_id: Types.ObjectId;


  @ApiProperty({
    description: 'ID of the instructor creating the module',
    example: '64a5678f7d9b5f001f654321',
  })
  @IsMongoId()
  instructor_id: Types.ObjectId;


  @ApiProperty({
    description: 'Title of the module',
    example: 'Introduction to Algorithms',
  })
  @IsString()
  title: string;


  @ApiProperty({
    description: 'Content or description of the module',
    example: 'This module covers the basics of sorting and searching algorithms.',
    required: false,
  })
  @IsOptional()
  @IsString()
  content?: string;


  @ApiProperty({
    description: 'List of resources (URLs or file paths) associated with the module',
    example: ['https://example.com/resource1', 'https://example.com/resource2'],
    required: false,
  })
  @IsArray()
  @IsOptional()
  resources?: string[];

  @ApiProperty({
    description: 'Type of the quiz associated with the module',
    enum: QuizType,
    example: QuizType.MCQ,
    required: false,
  })
  @IsEnum(QuizType, { message: 'It must be of type quiz type' })
  @IsOptional()
  quiz_type?: QuizType;


  @ApiProperty({
    description: 'Array of question IDs from the question bank',
    example: ['64a2345f7d9b5f001f234567', '64a3456f7d9b5f001f345678'],
    required: false,
  })
  @IsArray()
  @IsOptional()
  @IsMongoId({ each: true })
  question_bank?: Types.ObjectId[];

  
  @ApiProperty({
    description: 'Difficulty level of the module',
    enum: Difficulty,
    example: Difficulty.HARD,
  })
  @IsEnum(Difficulty, { message: 'It must be of type quiz type' })
  module_difficulty: Difficulty;
}
