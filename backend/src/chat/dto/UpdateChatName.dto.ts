import { IsOptional, IsString , IsEnum, IsArray, ArrayNotEmpty} from 'class-validator';
import { Exists } from '../../common/validators/exists.validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateChatNameDto{
  @ApiProperty({
    description: 'The new name for the chat',
    type: String,
  })
  
  @IsString()
  chatName: string;
}