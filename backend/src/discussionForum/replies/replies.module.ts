import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RepliesController } from './replies.controller';
import { RepliesService } from './replies.service';
import { Reply, ReplySchema } from '../../Models/reply.schema';
import { Thread, ThreadSchema } from '../../Models/thread.schema';  
import { User, UserSchema } from 'src/Models/user.schema';
import { ForumModule } from '../forum/forum.module';
import { CoursesModule } from 'src/courses/courses.module';
import { Course, CourseSchema } from 'src/Models/course.schema';
import { Progress, ProgressSchema } from 'src/Models/progress.schema';
import { Response, ResponseSchema } from 'src/Models/response.schema';
import { ThreadsModule } from '../threads/threads.module';
import { ModuleSchema } from 'src/Models/modules.schema';
import { QuestionSchema } from 'src/Models/question.schema';
import { ModuleService } from 'src/module/module.service';
import { ModuleModule } from 'src/module/module.module';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/users/users.module';
import { LogsModule } from 'src/log/log.module';
import { NotificationModule } from 'src/WebSockets/notification/notification.module';

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
    forwardRef(()=>ForumModule),
    forwardRef(()=>ThreadsModule),
    ModuleModule,
    AuthModule,
    CoursesModule,
    UserModule,
    LogsModule,
    forwardRef(()=>NotificationModule)
  ],
  controllers: [RepliesController],
  providers: [RepliesService],
  exports: [RepliesService],
})
export class ReplyModule {}
