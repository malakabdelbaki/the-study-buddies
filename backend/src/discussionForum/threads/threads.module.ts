import { Module } from '@nestjs/common';
import { ThreadsController } from './threads.controller';
import { ThreadsService } from './threads.service';
import { MongooseModule } from '@nestjs/mongoose';  
import { Thread, ThreadSchema } from '../../Models/thread.schema';
import { ForumService } from '../forum/forum.service';
import { ForumModule } from '../forum/forum.module';
import { CoursesModule } from 'src/courses/courses.module';
import { User } from 'src/Models/user.schema';
import { UserModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import { ExistsOnDatabase } from 'src/common/decorators/exists-on-database.decorator';
import { ExistsOnDatabaseValidator } from 'src/common/validators/exists-on-database.validator';
import { LogsModule } from 'src/log/log.module';
import { ReplyModule } from '../replies/replies.module';
import { Reply, ReplySchema } from 'src/Models/reply.schema';
import { NotificationModule } from 'src/WebSockets/notification/notification.module';
import { forwardRef } from '@nestjs/common';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Thread.name, schema: ThreadSchema },
      { name: Reply.name, schema: ReplySchema },
    ]),
    ForumModule,
    CoursesModule,
    UserModule,
    AuthModule,
    LogsModule,
    ReplyModule,
   forwardRef(()=> NotificationModule),
  ],
  controllers: [ThreadsController],
  providers: [ThreadsService, ExistsOnDatabaseValidator],
  exports: [ThreadsService, MongooseModule.forFeature([{ name: Thread.name, schema: ThreadSchema }])],
})
export class ThreadsModule {}
