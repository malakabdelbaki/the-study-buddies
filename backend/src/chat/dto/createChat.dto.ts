import { IsOptional, IsString , IsEnum, IsArray, ArrayNotEmpty} from 'class-validator';
import { Exists } from '../../common/validators/exists.validator';
// import { HasRole } from '../../common/validators/has-role.validator';
import { Role } from '../../enums/role.enum';
import {Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateChatDto{
  @ApiProperty({
    description: 'The name of the chat',
    type: String,
  })
  @IsString()
  chatName: string;

  @ApiProperty({
    description: 'List of participant IDs to create the chat with.',
    type: [String],
    example: ['60a68a37b8b5b8cfe5b5f5c0', '60a68a37b8b5b8cfe5b5f5c1'],
  })
  @IsArray()
  @ArrayNotEmpty()
  @Transform(({ value }) => value.map((id: string) => new Types.ObjectId(id)))
  participants: Types.ObjectId[];
}