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
import { AuthModule } from 'src/auth/auth.module';
import { ExistsOnDatabase } from 'src/common/decorators/exists-on-database.decorator';
import { ExistsOnDatabaseValidator } from 'src/common/validators/exists-on-database.validator';
import { LogsModule } from 'src/log/log.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Thread.name, schema: ThreadSchema }]),
    ForumModule,
    CoursesModule,
    UserModule,
    AuthModule,
    LogsModule,
  ],
  controllers: [ThreadsController],
  providers: [ThreadsService, ExistsOnDatabaseValidator],
  exports: [ThreadsService, MongooseModule.forFeature([{ name: Thread.name, schema: ThreadSchema }])],
})
export class ThreadsModule {}
