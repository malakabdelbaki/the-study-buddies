import { Module, Res } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RepliesController } from './replies.controller';
import { RepliesService } from './replies.service';
import { Reply, ReplySchema } from '../../Models/reply.schema';
import { Thread, ThreadSchema } from '../../Models/thread.schema';  
import { User, UserSchema } from 'src/models/user.schema';
import { UserService } from 'src/users/users.service';
import { ForumModule } from '../forum/forum.module';
import { CoursesModule } from 'src/courses/courses.module';
import { Course, CourseSchema } from 'src/Models/course.schema';
import { Progress, ProgressSchema } from 'src/models/progress.schema';
import { Response, ResponseSchema } from 'src/models/response.schema';
import { ThreadsModule } from '../threads/threads.module';
import { ThreadsService } from '../threads/threads.service';
import { CoursesService } from 'src/courses/courses.service';
import { ModuleSchema } from 'src/Models/modules.schema';
import { QuestionSchema } from 'src/Models/question.schema';
import { ModuleService } from 'src/module/module.service';
import { ModuleModule } from 'src/module/module.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Reply.name, schema: ReplySchema },
      { name: Thread.name, schema: ThreadSchema },
      { name: User.name, schema: UserSchema },
      { name: Course.name, schema: CourseSchema },
      { name: Progress.name, schema: ProgressSchema },
      { name: Response.name, schema: ResponseSchema },
    ]),
    ForumModule,
    ThreadsModule,
    ModuleModule
  ],
  controllers: [RepliesController],
  providers: [RepliesService, UserService, ThreadsService, CoursesService],
  exports: [RepliesService],
})
export class ReplyModule {}
