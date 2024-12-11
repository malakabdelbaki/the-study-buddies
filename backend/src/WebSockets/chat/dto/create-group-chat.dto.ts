import { IsOptional, IsString , IsEnum, IsArray, ArrayNotEmpty, IsMongoId, Validate} from 'class-validator';
//// import { Exists } from '../../common/validators/exists.validator';
// import { HasRole } from '../../common/validators/has-role.validator';
import { Role } from '../../../enums/role.enum';
import {Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { ExistsOnDatabase } from 'src/common/decorators/exists-on-database.decorator';
import { Transform } from 'class-transformer';
import { Chat } from 'src/Models/chat.schema';
import { ChatVisibility } from 'src/enums/chat-visibility.enum';

export class CreateGroupChatDto{
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
  @ExistsOnDatabase({ modelName: 'Course', column: '_id' })
  course_id: Types.ObjectId;

  @ApiProperty({
    description: 'array of participants in chat',
    type: [Types.ObjectId]
  })
  @Validate(ExistsOnDatabase, [{ modelName: 'User', column: '_id' }], {
    each: true, // Applies the `ExistsOnDatabase` validator to each element in the array
    message: 'One or more student IDs do not exist in the database',
  })
  participants: Types.ObjectId[]

  @ApiProperty({
    description: 'The type of chat',
    type: String,
  })
  @IsEnum(ChatVisibility)
  chat_type: ChatVisibility;



  
}