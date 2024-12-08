import { IsNotEmpty, IsMongoId } from 'class-validator';
import { ExistsOnDatabase } from 'src/common/decorators/exists-on-database.decorator';

export class EnrollInCourseDto {
    @IsNotEmpty()
    @IsMongoId()
    @ExistsOnDatabase({modelName:'User',column:'_id'})
    studentId: string;
  
    @IsNotEmpty()
    @IsMongoId()
    @ExistsOnDatabase({modelName:'Course',column:'_id'})
    courseId: string;
  }