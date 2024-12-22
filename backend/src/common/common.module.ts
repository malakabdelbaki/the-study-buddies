import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExistsOnDatabaseValidator } from './validators/exists-on-database.validator';
import { ModuleSchema } from '../Models/modules.schema';
import { ResponseSchema } from '../Models/response.schema';
import { CourseSchema } from '../Models/course.schema';
import { ProgressSchema } from '../Models/progress.schema';
import { User, UserSchema } from '../Models/user.schema';
import { ThreadSchema } from '../Models/thread.schema';
import { ReplySchema } from '../Models/reply.schema';

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
