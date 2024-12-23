import { IsArray, IsBoolean, IsEnum, isEnum, IsMongoId, isMongoId, IsOptional, IsString } from "class-validator";
import { Types } from "mongoose";
import { ExistsOnDatabase } from "src/common/decorators/exists-on-database.decorator";
import { Course_diff } from "src/enums/course-diff.enum";

export class CreateCourseDto {
  
    @IsString()
    title: string;

    @IsOptional()
    description?: string;

    @IsString()
    category: string;

    @IsMongoId()
    @ExistsOnDatabase({modelName:'User',column:'_id'})
    @IsOptional()
    instructor_id: Types.ObjectId;
    
    @IsEnum(Course_diff,{message:'It must be of type course difficulty'})
    difficulty_level: Course_diff;

    @IsOptional()
    @IsArray()
    key_words?:string[];

    @IsOptional()
    @IsBoolean()
    isNoteEnabled?: boolean = true;
}
