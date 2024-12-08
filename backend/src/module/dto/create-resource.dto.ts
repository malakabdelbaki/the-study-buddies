import { ApiProperty, PartialType } from "@nestjs/swagger";
import { CreateModuleDto } from "./create-module.dto";
import { IsMongoId, IsString, IsArray, IsEnum, IsOptional } from "class-validator";
import { Types } from "mongoose";
import { ExistsOnDatabase } from "src/common/decorators/exists-on-database.decorator";
import { MatchInstructor } from "src/common/decorators/instructor-matches-course-instructor.decorator";
import { MatchInstructorForModule } from "src/common/decorators/instructor-matches-module-instructor.decorator";

export class ResourceDto {

      @ApiProperty({
        description: 'The module id',
        type: Types.ObjectId,
        example: '9c1203b289738921a231',
      })
      @IsMongoId()
      @ExistsOnDatabase({ modelName: 'Module', column: '_id' })
      //@MatchInstructorForModule()
      module_id: Types.ObjectId;
    
      @ApiProperty({
        description: 'The title',
        type: String,
        example: 'title 1',
      })
      @IsString()
      title:string;
  
      @IsOptional()
      @IsString()
      description?:string;
  
      @IsOptional()
      @IsString()
      type?:string;

  
      @ApiProperty({
        description:"The URL",
        type:String
      })
      @IsOptional()
      @IsString()
      url?:string;

      
}