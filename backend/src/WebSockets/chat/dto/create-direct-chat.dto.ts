import { IsOptional, IsString , IsEnum, IsArray, ArrayNotEmpty, IsMongoId} from 'class-validator';
//// import { Exists } from '../../common/validators/exists.validator';
// import { HasRole } from '../../common/validators/has-role.validator';
import { Role } from '../../../enums/role.enum';
import {Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateDirectChatDto{
  @ApiProperty({
    description: 'The name of the chat',
    type: String,
  })
  @IsString()
  chatName: string;

  @ApiProperty({
    description: 'course_id',
    type: Types.ObjectId, 
  })
  @IsMongoId()
  courseId: Types.ObjectId;

  @ApiProperty({
    description: 'receiver_id',
    type: Types.ObjectId, 
  })
  @IsMongoId()
  receiverId: Types.ObjectId;
}