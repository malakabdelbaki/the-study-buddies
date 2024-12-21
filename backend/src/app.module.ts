import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CoursesModule } from './courses/courses.module';
import { PerformanceModule } from './performance/performance.module';
import { QuizzesModule } from './quizzes/quizzes.module';
import dbconfig from './config/dbconfig';
import { ChatModule } from './WebSockets/chat/chat.module';
//// import { ValidatorsModule } from './common/validators/validators.module';
import { UserModule } from './users/users.module';

import { ForumService } from './discussionForum/forum/forum.service';
import { ForumController } from './discussionForum/forum/forum.controller';
import { ForumModule } from './discussionForum/forum/forum.module';
import { Thread } from './Models/thread.schema';
import { ThreadsModule } from './discussionForum/threads/threads.module';
import { ReplyModule } from './discussionForum/replies/replies.module';
import { ModuleModule } from './module/module.module';
import { NoteController } from './note/note.controller';
import { NoteModule } from './note/note.module';
import { AuthModule } from './auth/auth.module';
import { ValidatorsModule } from './common/validators/validators.module';
import { LogsModule } from './log/log.module';
import { WebSocketsModule } from './WebSockets/web-sockets.module';
import { PusherService } from './pusher/pusher.service';
import { AuthenticationMiddleware } from './auth/middleware/authentication.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes configuration globally available
    }),
    MongooseModule.forRoot(process.env.MONGO_CONNECTION),
    PerformanceModule,
    CoursesModule,
    UserModule,
    ChatModule,
    ModuleModule,
    ForumModule,
    ThreadsModule,
    ReplyModule,
    QuizzesModule,
    NoteModule,
    AuthModule,
    ValidatorsModule,
    LogsModule,
    WebSocketsModule
  ],
  controllers: [AppController, NoteController],
  providers: [AppService, PusherService, AuthenticationMiddleware],
  exports: [AppService, MongooseModule],
  // controllers: [AppController, QuizzesController],
  // providers: [AppService, QuizzesService],
})
export class AppModule {
  // configure(consumer: MiddlewareConsumer) {
  //   // Apply Authentication Middleware to all routes
  //   consumer.apply(AuthenticationMiddleware).forRoutes(
  //     { path: 'api/logs', method: RequestMethod.ALL },
  //     //{ path: 'api/another-protected-route', method: RequestMethod.ALL },
  //   );
  // }
}
