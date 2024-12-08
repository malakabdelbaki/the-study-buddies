import { Module } from '@nestjs/common';
import { Mongoose } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { Notification, NotificationSchema } from '../../models/notification.schema';
import { NotificationController } from './notification.controller';
import { NotificationsGateway } from './notification.gateway';
import { NotificationsService } from './notification.service';
import { UserModule } from '../../users/users.module';
import { ChatModule } from 'src/WebSockets/chat/chat.module';
import { forwardRef } from '@nestjs/common';
import { Thread } from 'src/Models/thread.schema';
import { ThreadsModule } from 'src/discussionForum/threads/threads.module';
import { ThreadsService } from 'src/discussionForum/threads/threads.service';
import { ForumService } from 'src/discussionForum/forum/forum.service';
import { CoursesService } from 'src/courses/courses.service';
import { ThreadSchema } from 'src/Models/thread.schema';
import { Forum } from 'src/Models/forum.schema';
import { ForumSchema } from 'src/Models/forum.schema';
import { Course } from 'src/Models/course.schema';
import { CourseSchema } from 'src/Models/course.schema';
import { Announcement, AnnouncementSchema } from 'src/Models/announcement.schema';
import { AnnouncementModule } from 'src/announcement/announcement.module';  
import { ChatService } from '../chat/chat.service';
import { ModuleModule } from 'src/module/module.module';
import { Chat } from 'src/Models/chat.schema';
import { ChatSchema } from 'src/Models/chat.schema';
import { Message , MessageSchema} from 'src/Models/message.schema';
import { LogsModule } from 'src/log/log.module';
import { AuthModule } from 'src/auth/auth.module';
@Module({
  imports: [
  MongooseModule.forFeature([
    { name: Notification.name, schema: NotificationSchema },
    { name: Thread.name, schema: ThreadSchema },
    { name: Forum.name, schema: ForumSchema } ,
    { name: Course.name, schema: CourseSchema },
    { name: Chat.name, schema: ChatSchema },
    { name: Message.name, schema: MessageSchema },

  ]),
  forwardRef(() => UserModule), // Resolve circular dependency
  forwardRef(() => ChatModule), // Resolve circular dependency
  ThreadsModule,
  forwardRef(() => AnnouncementModule),
  ModuleModule,
  LogsModule,
  AuthModule
  ],
  controllers: [ NotificationController],
  providers: [ NotificationsService, NotificationsGateway, ThreadsService, ForumService, CoursesService, ChatService],
  exports: [NotificationsService, NotificationsGateway, MongooseModule],
})
export class NotificationModule {}
