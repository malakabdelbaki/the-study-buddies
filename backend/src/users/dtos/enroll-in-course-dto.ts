import { IsNotEmpty, IsMongoId } from 'class-validator';

export class EnrollInCourseDto {
    @IsNotEmpty()
    @IsMongoId()
    studentId: string;
  
    @IsNotEmpty()
    @IsMongoId()
    courseId: string;
  }