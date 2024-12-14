import { IsString, IsOptional, IsMongoId, Validate } from 'class-validator';
import { ExistsOnDatabase } from 'src/common/decorators/exists-on-database.decorator';
import { StudentCanAccessModuleValidator } from 'src/common/validators/student-can-access-module.validator';

export class CreateQuizDto {

    @IsString()
    @IsMongoId()
    @ExistsOnDatabase({modelName:'Module',column:'_id'})
    // @Validate(StudentCanAccessModuleValidator)
        module_id: string;

    @IsString()
    @IsMongoId()
    @ExistsOnDatabase({modelName:'User',column:'_id'})
        user_id: string;

  
}