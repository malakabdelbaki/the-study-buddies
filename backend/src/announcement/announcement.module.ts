import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnnouncementController } from './announcement.controller';
import { AnnouncementService } from './announcement.service';
import { Announcement, AnnouncementSchema } from '../Models/announcement.schema';
import { CoursesService } from 'src/courses/courses.service';
import { User } from 'src/models/user.schema';
import { UserService } from 'src/users/users.service';
import { NotificationsGateway } from 'src/WebSockets/notification/notification.gateway';
import { CoursesModule } from 'src/courses/courses.module';
import { UserModule } from 'src/users/users.module';
import { NotificationModule } from 'src/WebSockets/notification/notification.module';
import { forwardRef } from '@nestjs/common';  
import { AuthModule } from 'src/auth/auth.module';
import { LogsModule } from 'src/log/log.module';
import { ChatModule } from 'src/WebSockets/chat/chat.module';
import { ModuleModule } from 'src/module/module.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Announcement.name, schema: AnnouncementSchema },
    ]),
    forwardRef(() => CoursesModule),
    forwardRef(() => UserModule),
    forwardRef(() => NotificationModule),
    AuthModule,
    LogsModule,
    ModuleModule
  ],
  controllers: [AnnouncementController],
  providers: [AnnouncementService],
  exports: [AnnouncementService, MongooseModule],
})
export class AnnouncementModule {}
