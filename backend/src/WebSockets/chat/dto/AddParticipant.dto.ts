import { IsOptional, IsString , IsEnum, IsArray, ArrayNotEmpty, IsMongoId, Validate} from 'class-validator';
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
  @Validate(ExistsOnDatabase, [{ modelName: 'User', column: '_id' }], {
    each: true, 
    message: 'One or more student IDs do not exist in the database',
  })  
  participants: Types.ObjectId[];

}