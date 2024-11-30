

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class ModulePerformanceDto {
  @ApiProperty({ description: 'Module ID' })
  @IsString()
  @IsNotEmpty()
  moduleId: string;

  @ApiProperty({ description: 'Module title' })
  @IsString()
  @IsNotEmpty()
  moduleTitle: string;

  @ApiProperty({ description: 'Total number of students in the module' })
  @IsNumber()
  @Min(0)
  totalStudents: number;

  @ApiProperty({ description: 'Average quiz score for the module' })
  @IsNumber()
  @Min(0)
  averageScore: number;

  @ApiProperty({
    description: 'Performance categories for students in this module',
    type: Object,
  })
  @IsNotEmpty()
  performanceCategories: {
    belowAverage: number;
    average: number;
    aboveAverage: number;
    excellent: number;
  };
}
