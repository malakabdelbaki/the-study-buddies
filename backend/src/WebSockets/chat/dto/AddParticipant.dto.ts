import { IsOptional, IsString , IsEnum, IsArray, ArrayNotEmpty} from 'class-validator';
//// import { Exists } from '../../common/validators/exists.validator';
// import { HasRole } from '../../common/validators/has-role.validator';
import { Role } from '../../../enums/role.enum';
import {Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ExistsOnDatabase } from 'src/common/decorators/exists-on-database.decorator';
export class AddParticipantDto{
  @ApiProperty({
    description: 'List of participant IDs to add to the chat.',
    type: [String],
    example: ['60a68a37b8b5b8cfe5b5f5c0', '60a68a37b8b5b8cfe5b5f5c1'], // Example ObjectIds
  })
  @IsArray()
  @ArrayNotEmpty()
  @Transform(({ value }) => {
    return new Types.ObjectId(value); // Ensure it's converted to an ObjectId
  })  
  @ExistsOnDatabase({ modelName: 'User', column: '_id' })
  participant: Types.ObjectId;
}