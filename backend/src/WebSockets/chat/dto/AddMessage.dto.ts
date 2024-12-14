import { IsOptional, IsString , IsEnum, IsArray, ArrayNotEmpty, IsNotEmpty, IsMongoId} from 'class-validator';
//// import { Exists } from '../../common/validators/exists.validator';
// import { HasRole } from '../../common/validators/has-role.validator';
import { Role } from '../../../enums/role.enum';
import {Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ExistsOnDatabase } from 'src/common/decorators/exists-on-database.decorator';

export class AddMessageDto {
  
  @ApiProperty({
    description: 'The content of the message.',
    type: String,
    example: 'Hello, how are you?',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

}