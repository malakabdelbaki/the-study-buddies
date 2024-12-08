import { IsString, IsNotEmpty, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ExistsOnDatabase } from 'src/common/decorators/exists-on-database.decorator';

export class CreateReplyDto {
  @ApiProperty({ description: 'The ID of the user who created this reply' })
  @IsMongoId()
  @IsNotEmpty()
  @ExistsOnDatabase({ modelName: 'User', column: '_id' })
  user_id: string;


  @ApiProperty({ description: 'The ID of the thread the reply belongs to' })
  @IsMongoId()
  @IsNotEmpty()
  @ExistsOnDatabase({ modelName: 'Thread', column: '_id' })
  thread_id: string;

  @ApiProperty({ description: 'The content of the reply' })
  @IsString()
  @IsNotEmpty()
  content: string;
}
