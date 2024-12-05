import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ForumController } from './forum.controller';
import { ForumService } from './forum.service';
import { Forum, ForumSchema } from '../../Models/forum.schema';
import { Course, CourseSchema } from '../../Models/course.schema';
import { CoursesService } from 'src/courses/courses.service';
import { UserService } from 'src/users/users.service';
import { Thread, ThreadSchema } from '../../Models/thread.schema';
import { UserModule } from 'src/users/users.module';
import { CoursesModule } from 'src/courses/courses.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        { name: Forum.name, schema: ForumSchema },
        { name: Course.name, schema: CourseSchema },
        { name: Thread.name, schema: ThreadSchema  },
      ]), // Register ForumModel
      UserModule,
      CoursesModule,
      AuthModule
  ],
  providers: [ForumService],
  controllers: [ForumController],
  exports: [ForumService], 
})
export class ForumModule {}
