import { IsNotEmpty, IsMongoId, IsNumber, Min, Max } from 'class-validator';
import { ExistsOnDatabase } from 'src/common/decorators/exists-on-database.decorator';

export class RateDto {
  // @IsNotEmpty()
  // @IsMongoId()
  // studentId: string;

  @IsNotEmpty()
  targetId: string; // ModuleId, CourseId, or InstructorId

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;
}