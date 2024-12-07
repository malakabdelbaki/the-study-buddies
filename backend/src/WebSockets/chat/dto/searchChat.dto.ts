import { IsOptional, IsString , IsEnum, IsArray, ArrayNotEmpty, Validate} from 'class-validator';
//// import { Exists } from '../../common/validators/exists.validator';
// import { HasRole } from '../../common/validators/has-role.validator';
import { Role } from '../../../enums/role.enum';
import {Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ExistsOnDatabase } from 'src/common/decorators/exists-on-database.decorator';

export class SearchChatsDto{
  @ApiProperty({
    description: 'The name of the chat to filter by.',
    type: String,
    required: false,
  })
  
  @IsOptional()
  @IsString()
  chatName?: string;

  @ApiProperty({
    description: 'Search query to filter messages or chats.',
    type: String,
    required: false,
    example: 'Hello',
  })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiProperty({
    description: 'List of participant IDs to filter chats by.',
    type: [String],
    example: ['60a68a37b8b5b8cfe5b5f5c0'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @Transform(({ value }) => value.map((id: string) => new Types.ObjectId(id)))
  @Validate(ExistsOnDatabase, [{ modelName: 'User', column: '_id' }], {
    each: true, // Applies the `ExistsOnDatabase` validator to each element in the array
    message: 'One or more student IDs do not exist in the database',
  })
  participants?: Types.ObjectId[];
}