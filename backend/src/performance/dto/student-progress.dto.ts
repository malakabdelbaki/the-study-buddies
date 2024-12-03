import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, Min, Max, IsDate, IsOptional } from 'class-validator';

export class StudentProgressDto {
  @ApiProperty({ description: 'The ID of the course' })
  @IsString()
  @IsNotEmpty()
  courseId: string;

  @ApiProperty({ description: 'The name of the course' })
  @IsString()
  @IsNotEmpty()
  courseName: string;

  @ApiProperty({ description: 'Completion percentage of the course' })
  @IsNumber()
  @Min(0)
  @Max(100)
  completionPercentage: number;

  @ApiProperty({ description: 'Last accessed date of the course' })
  @IsDate()
  lastAccessed: Date;

  @ApiProperty({ description: 'The average score for the course' })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  averageScore: number;  // Added averageScore field for the course

  
}
