import { IsOptional, IsString , IsEnum, IsArray, ArrayNotEmpty, IsNotEmpty} from 'class-validator';
//// import { Exists } from '../../common/validators/exists.validator';
// import { HasRole } from '../../common/validators/has-role.validator';
import { Role } from '../../../enums/role.enum';
import {Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ExistsOnDatabase } from 'src/common/decorators/exists-on-database.decorator';

export class AddMessageDto {
  @ApiProperty({
    description: 'The sender ID of the message.',
    type: String,
    example: '60a68a37b8b5b8cfe5b5f5c0', // Example ObjectId
  })

  @Transform(({ value }) => {
    return new Types.ObjectId(value); // Ensure it's converted to an ObjectId
  })
  @ExistsOnDatabase({ modelName: 'User', column: '_id' })
  sender_id: Types.ObjectId;

  @ApiProperty({
    description: 'The content of the message.',
    type: String,
    example: 'Hello, how are you?',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}