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
  ],
  controllers: [RepliesController],
  providers: [RepliesService, UserService],
  exports: [RepliesService],
})
export class ReplyModule {}
