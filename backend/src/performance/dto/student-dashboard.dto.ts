import { ApiProperty } from '@nestjs/swagger';

export class StudentDashboardDto {
  @ApiProperty({ description: 'The ID of the course' })
  courseId: string;

  @ApiProperty({ description: 'The name of the course' })
  courseName: string;

  @ApiProperty({ description: 'The percentage of the course completed' })
  completionPercentage: number;

  @ApiProperty({ description: 'The last accessed date of the course' })
  lastAccessed: Date;
}
