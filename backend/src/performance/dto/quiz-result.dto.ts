// src/performance/dto/quiz-result.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNumber, IsString } from 'class-validator';
import { ExistsOnDatabase } from 'src/common/decorators/exists-on-database.decorator';

export class StudentQuizResultDto {
  @ApiProperty()
  @IsMongoId()
  @ExistsOnDatabase({ modelName: 'User', column: '_id' })
  studentId: string;

  @ApiProperty()
  @IsString()
  studentName: string;

  @ApiProperty()
  @IsNumber()
  score: number;


}

export class QuizResultDto {
  @ApiProperty()
  quizId: string;

  @ApiProperty()
  quizTitle: string;

  @ApiProperty()
  totalQuestions: number;

  @ApiProperty()
  totalStudents: number;

  @ApiProperty()
  averageScore: number;

  @ApiProperty({ type: [StudentQuizResultDto] })
  studentResults: StudentQuizResultDto[];
}


