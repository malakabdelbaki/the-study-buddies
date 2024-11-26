import { PartialType } from '@nestjs/swagger';
import { CreateCourseDto } from './create-course.dto';
import { IsString, IsEnum, IsArray, IsMongoId, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Course_diff } from 'src/enums/course-diff.enum';
import { Types } from 'mongoose';

export class UpdateCourseDto extends PartialType(CreateCourseDto) {

  @ApiProperty({ description: 'Title of the course', required: false })
  @IsString()
  @IsOptional()

  title?: string;

  @ApiProperty({ description: 'Detailed description of the course', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Category of the course', required: false })
  @IsString()
  @IsOptional()

  category?: string;

  @ApiProperty({
    description: `Difficulty level of the course (${Object.values(Course_diff).join(', ')})`,
    enum: Course_diff,
    required: false,
  })
  @IsEnum(Course_diff, {
    message: `It must be one of the following: ${Object.values(Course_diff).join(', ')}`,
  })
  @IsOptional()
  difficulty_level?: Course_diff;

  @ApiProperty({
    description: 'List of student IDs enrolled in the course',
    type: [Types.ObjectId],
    required: false,
  })

  @IsArray()
  @IsOptional()
  students?: Types.ObjectId[];


  @ApiProperty({
    description: 'List of module IDs included in the course',
    type: [Types.ObjectId],
    required: false,
  })
  @IsArray()
  @IsOptional()
  modules?: Types.ObjectId[];
}
