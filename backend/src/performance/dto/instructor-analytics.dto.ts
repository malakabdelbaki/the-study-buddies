import { ApiProperty } from '@nestjs/swagger';

export class LowPerformingStudentDto {
  @ApiProperty({ description: 'Student ID' })
  studentId: string;

  @ApiProperty({ description: 'Student name' })
  studentName: string;

  @ApiProperty({ description: 'Student email' })
  email: string;

  @ApiProperty({ description: 'Completion percentage of the student' })
  completionPercentage: number;
}

export class InstructorAnalyticsDto {
  @ApiProperty({ description: 'Course ID' })
  courseId: string;

  @ApiProperty({ description: 'Course title' })
  courseTitle: string;

  @ApiProperty({ description: 'Total number of students' })
  totalStudents: number;

  @ApiProperty({ description: 'Average completion percentage of the course' })
  averageCompletion: number;

  @ApiProperty({
    description: 'List of low-performing students',
    type: [LowPerformingStudentDto],
  })
  lowPerformingStudents: LowPerformingStudentDto[];
}

  