import { ApiProperty, PartialType } from "@nestjs/swagger";
import { CreateModuleDto } from "./create-module.dto";
import { IsMongoId, IsString, IsArray, IsEnum, IsOptional } from "class-validator";
import { Types } from "mongoose";

export class UpdateResourceDto {  
      @ApiProperty({
        description: 'The title',
        type: String,
        example: 'title 1',
      })
      @IsString()
      @IsOptional()
      title?:string;
  
      @ApiProperty({
        description: 'The description',
        type: String,
        example:'it is the desc',
      })
      @IsOptional()
      @IsString()
      description?:string;
  
}