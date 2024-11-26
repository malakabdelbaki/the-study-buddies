import { ApiProperty } from '@nestjs/swagger';

export class StudentProgressDto {
  @ApiProperty({ description: 'The ID of the course' })
  courseId: string;

  @ApiProperty({ description: 'The name of the course' })
  courseName: string;

  @ApiProperty({ description: 'Completion percentage of the course' })
  completionPercentage: number;

  @ApiProperty({ description: 'Last accessed date of the course' })
  lastAccessed: Date;
}
