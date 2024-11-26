import { IsEnum, isEnum, IsMongoId, isMongoId, IsOptional, IsString } from "class-validator";
import { Types } from "mongoose";
import { Course_diff } from "src/enums/course-diff.enum";

export class CreateCourseDto {
  
    @IsString()
    title: string;

    @IsOptional()
    description?: string;

    @IsString()
    category: string;

    @IsMongoId()
    instructor_id: Types.ObjectId;
    
    @IsEnum(Course_diff,{message:'It must be of type course difficulty'})
    difficulty_level: Course_diff;
}
