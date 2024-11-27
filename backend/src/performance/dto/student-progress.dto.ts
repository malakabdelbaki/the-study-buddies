import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, Min, Max, IsDate } from 'class-validator';

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
}
