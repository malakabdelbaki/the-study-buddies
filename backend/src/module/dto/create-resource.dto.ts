import { ApiProperty, PartialType } from "@nestjs/swagger";
import { CreateModuleDto } from "./create-module.dto";
import { IsMongoId, IsString, IsArray, IsEnum, IsOptional } from "class-validator";
import { Types } from "mongoose";

export class ResourceDto {

      @ApiProperty({
        description: 'The module id',
        type: Types.ObjectId,
        example: '9c1203b289738921a231',
      })
      @IsMongoId()
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