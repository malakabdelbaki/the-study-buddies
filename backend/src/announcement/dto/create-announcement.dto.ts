import { IsNotEmpty, IsMongoId, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ExistsOnDatabase } from 'src/common/decorators/exists-on-database.decorator';

export class CreateAnnouncementDto {
  @ApiProperty({ example: '60f1b9b3b3f4f00015f2f3b1' })
  @IsNotEmpty()
  @IsMongoId()
  @ExistsOnDatabase({ modelName: 'Course', column: '_id' })
  course_id: string;

  @ApiProperty({ example: '60f1b9b3b3f4f00015f2f3b1' })
  @IsNotEmpty()
  @IsMongoId()
  @ExistsOnDatabase({ modelName: 'User', column: '_id' })
  instructor_id: string;

  @ApiProperty({ example: 'This is an announcement' })
  @IsNotEmpty()
  @IsString()
  content: string;
}
