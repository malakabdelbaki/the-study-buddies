import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExistsOnDatabaseValidator } from './validators/exists-on-database.validator';
import { ModuleSchema } from '../Models/modules.schema';
import { ResponseSchema } from '../models/response.schema';
import { CourseSchema } from '../models/course.schema';
import { ProgressSchema } from '../models/progress.schema';
import { User, UserSchema } from '../models/user.schema';
import { ThreadSchema } from '../models/thread.schema';
import { ReplySchema } from '../models/reply.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Module', schema: ModuleSchema },
      { name: 'Response', schema: ResponseSchema },
      { name: 'Course', schema: CourseSchema },
      { name: 'Progress', schema: ProgressSchema },
      { name: User.name, schema: UserSchema },
      { name: 'Thread', schema: ThreadSchema },
      { name: 'Reply', schema: ReplySchema },
    ]), // Add relevant schemas here
  ],
  providers: [ExistsOnDatabaseValidator],
  exports: [ExistsOnDatabaseValidator],
})
export class CommonModule {}
