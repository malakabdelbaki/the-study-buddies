import { IsNotEmpty, IsMongoId } from 'class-validator';

export class CreateProgressDto {
    @IsNotEmpty()
    @IsMongoId()
    userId: string;
  
    @IsNotEmpty()
    @IsMongoId()
    courseId: string;
  }
  