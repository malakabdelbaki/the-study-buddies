import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ModuleSchema } from '../../Models/modules.schema';
import { Module as M } from '../../Models/modules.schema';
import { Response, ResponseSchema } from '../../Models/response.schema';
import { Course, CourseSchema } from '../../Models/course.schema';
import { Progress, ProgressSchema } from '../../Models/progress.schema';
import { User, UserSchema } from '../../Models/user.schema';
import { Thread, ThreadSchema } from '../../Models/thread.schema';
import { Reply, ReplySchema } from '../../Models/reply.schema';
import { ExistsOnDatabase } from '../decorators/exists-on-database.decorator';
import { ExistsOnDatabaseValidator } from './exists-on-database.validator';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: M.name, schema: ModuleSchema },
      { name: Response.name, schema: ResponseSchema },
      { name: Course.name, schema: CourseSchema },
      { name: Progress.name, schema: ProgressSchema },
      { name: User.name, schema: UserSchema },
      { name: Thread.name, schema: ThreadSchema },
      { name: Reply.name, schema: ReplySchema },
    ]), // Add relevant schemas here
  ],
  providers: [ExistsOnDatabaseValidator],
  exports: [ExistsOnDatabaseValidator],  
})
export class ValidatorsModule {}
