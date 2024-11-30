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

  @ApiProperty({ description: 'Total time spent by the student on the course (in minutes)' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  totalTimeSpent: number;  // Total time spent on the course

  @ApiProperty({ description: 'Number of times the student accessed the course in the last week' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  frequencyLastWeek: number;  // Frequency in the last week (number of accesses)

  @ApiProperty({ description: 'Measure of consistency: number of days the student accessed the course in the last 30 days' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  consistencyLastMonth: number;  // Consistency measure (e.g., number of days accessed in the last month)
}
