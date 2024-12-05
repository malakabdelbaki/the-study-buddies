import { IsNotEmpty, IsMongoId, IsNumber, Min, Max } from 'class-validator';

export class RateDto {
  @IsNotEmpty()
  @IsMongoId()
  studentId: string;

  @IsNotEmpty()
  @IsMongoId()
  targetId: string; // ModuleId, CourseId, or InstructorId

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;
}