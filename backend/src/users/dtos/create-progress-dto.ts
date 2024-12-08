import { IsNotEmpty, IsMongoId } from 'class-validator';
import { ExistsOnDatabase } from 'src/common/decorators/exists-on-database.decorator';

export class CreateProgressDto {
    
    @IsNotEmpty()
    @IsMongoId()
    @ExistsOnDatabase({modelName:'Course',column:'_id'})
    courseId: string;
  }
  