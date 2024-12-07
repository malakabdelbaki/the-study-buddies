import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, Min, Max, IsEmail, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ModulePerformanceDto } from './module-performance.dto';
import { ExistsOnDatabase } from 'src/common/decorators/exists-on-database.decorator';



export class InstructorAnalyticsDto {
  @ApiProperty({ description: 'Course ID' })
  @IsString()
  @IsNotEmpty()
  @ExistsOnDatabase({ modelName: 'Course', column: '_id' })
  courseId: string;

  @ApiProperty({ description: 'Course title' })
  @IsString()
  @IsNotEmpty()
  courseTitle: string;

  @ApiProperty({ description: 'Total number of students' })
  @IsNumber()
  @Min(0)
  totalStudents: number;

  @ApiProperty({ description: 'Total number of students who completed the course' })
  @IsNumber()
  @Min(0)
  completedStudents: number;

  @ApiProperty({ description: 'Average completion percentage of the course' })
  @IsNumber()
  @Min(0)
  @Max(100)
  averageCompletion: number;

 
  
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
    description: 'Overall student performance across modules in the course',
    type: Object,
  })
  @IsNotEmpty()
  overallstudentPerformance: {
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
  @Type(() => ModulePerformanceDto)
  modulesPerformance: ModulePerformanceDto[];
}


  