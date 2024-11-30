// src/performance/dto/quiz-result.dto.ts

import { ApiProperty } from '@nestjs/swagger';

export class StudentQuizResultDto {
  @ApiProperty()
  studentId: string;

  @ApiProperty()
  studentName: string;

  @ApiProperty()
  score: number;

  @ApiProperty()
  answers: string[];
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


