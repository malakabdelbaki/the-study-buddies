import { Module } from '@nestjs/common';
import { ThreadsController } from './threads.controller';
import { ThreadsService } from './threads.service';
import { MongooseModule } from '@nestjs/mongoose';  
import { Thread, ThreadSchema } from '../../Models/thread.schema';
import { ForumService } from '../forum/forum.service';
import { ForumModule } from '../forum/forum.module';
import { CoursesModule } from 'src/courses/courses.module';
import { User } from 'src/models/user.schema';
import { UserModule } from 'src/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Thread.name, schema: ThreadSchema }]),
    ForumModule,
    CoursesModule,
    UserModule
  ],
  controllers: [ThreadsController],
  providers: [ThreadsService],
})
export class ThreadsModule {}
