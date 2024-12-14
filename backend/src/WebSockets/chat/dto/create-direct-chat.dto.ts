import { IsOptional, IsString , IsEnum, IsArray, ArrayNotEmpty, IsMongoId} from 'class-validator';
//// import { Exists } from '../../common/validators/exists.validator';
// import { HasRole } from '../../common/validators/has-role.validator';
import { Role } from '../../../enums/role.enum';
import {Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ExistsOnDatabase } from 'src/common/decorators/exists-on-database.decorator';

export class CreateDirectChatDto{
  @ApiProperty({
    description: 'The name of the chat',
    type: String,
  })
  @IsString()
  @IsOptional()
  chatName: string;

  @ApiProperty({
    description: 'course_id',
    type: Types.ObjectId, 
  })
  @IsMongoId()
  @ExistsOnDatabase({ modelName: 'Course', column: '_id' })
  course_id: Types.ObjectId;

  @ApiProperty({
    description: 'receiver_id',
    type: Types.ObjectId, 
  })
  @IsMongoId()
  @ExistsOnDatabase({ modelName: 'User', column: '_id' })
  receiver_id: Types.ObjectId;
}