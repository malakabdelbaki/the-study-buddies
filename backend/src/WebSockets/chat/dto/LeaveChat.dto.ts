import { IsOptional, IsString , IsEnum, IsArray, ArrayNotEmpty, IsMongoId} from 'class-validator';
//// import { Exists } from '../../common/validators/exists.validator';
// import { HasRole } from '../../common/validators/has-role.validator';
import { Role } from '../../../enums/role.enum';
import {Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ExistsOnDatabase } from 'src/common/decorators/exists-on-database.decorator';
export class LeaveChatDto{
  @IsArray()
  @ArrayNotEmpty()
  @Transform(({ value }) => {
    return new Types.ObjectId(value); // Ensure it's converted to an ObjectId
  })  
  @ExistsOnDatabase({ modelName: 'User', column: '_id' })
  participant: Types.ObjectId;

  @IsMongoId()
  @ExistsOnDatabase({ modelName: 'Chat', column: '_id' })
  chat_id: Types.ObjectId;
}