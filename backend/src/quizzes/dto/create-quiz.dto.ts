import { IsString, IsOptional, IsMongoId } from 'class-validator';
import { ExistsOnDatabase } from 'src/common/decorators/exists-on-database.decorator';

export class CreateQuizDto {

    @IsString()
    @IsMongoId()
    @ExistsOnDatabase({modelName:'Module',column:'_id'})
        module_id: string;

    @IsString()
    @IsMongoId()
    @ExistsOnDatabase({modelName:'User',column:'_id'})
        user_id: string;

  
}