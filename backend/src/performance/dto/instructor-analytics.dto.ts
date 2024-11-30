import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, Min, Max, IsEmail, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ModulePerformanceDto } from './module-performance.dto';

// export class LowPerformingStudentDto {
//   @ApiProperty({ description: 'Student ID' })
//   @IsString()
//   @IsNotEmpty()
//   studentId: string;

//   @ApiProperty({ description: 'Student name' })
//   @IsString()
//   @IsNotEmpty()
//   studentName: string;

//   @ApiProperty({ description: 'Student email' })
//   @IsEmail()
//   email: string;

//   @ApiProperty({ description: 'Completion percentage of the student' })
//   @IsNumber()
//   @Min(0)
//   @Max(100)
//   completionPercentage: number;
// }

export class InstructorAnalyticsDto {
  @ApiProperty({ description: 'Course ID' })
  @IsString()
  @IsNotEmpty()
  courseId: string;

  @ApiProperty({ description: 'Course title' })
  @IsString()
  @IsNotEmpty()
  courseTitle: string;

  @ApiProperty({ description: 'Total number of students' })
  @IsNumber()
  @Min(0)
  totalStudents: number;

  @ApiProperty({ description: 'Average completion percentage of the course' })
  @IsNumber()
  @Min(0)
  @Max(100)
  averageCompletion: number;

  // @ApiProperty({
  //   description: 'List of low-performing students',
  //   type: [LowPerformingStudentDto],
  // })
  
  @ApiProperty({
    description: 'Performance categories for students in the course',
    type: Object,
  })
  @IsNotEmpty()
  CompletionPerformanceCategories: {
    belowAverage: number;
    average: number;
    aboveAverage: number;
    excellent: number;
  };

  @ApiProperty({
    description: 'List of performance data for each module in the course',
    type: [ModulePerformanceDto],
  })

  @IsArray()
  @ValidateNested({ each: true })
  //@Type(() => LowPerformingStudentDto) // Required for nested validation
  //lowPerformingStudents: LowPerformingStudentDto[];
  @Type(() => ModulePerformanceDto)
  modulesPerformance: ModulePerformanceDto[];
}


  