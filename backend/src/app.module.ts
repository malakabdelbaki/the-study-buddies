import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CoursesModule } from './courses/courses.module';
import { PerformanceModule } from './performance/performance.module';
import { QuizzesController } from './quizzes/quizzes.controller';
import { QuizzesService } from './quizzes/quizzes.service';
import dbconfig from './config/dbconfig';
import { ChatModule } from './chat/chat.module';
//// import { ValidatorsModule } from './common/validators/validators.module';
import { UserModule } from './users/users.module';
import { ModuleModule } from './module/module.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_CONNECTION),
    PerformanceModule,
    CoursesModule,
    UserModule,
    ChatModule,
   // // ValidatorsModule,
    ModuleModule
  ],
  controllers: [AppController, QuizzesController],
  providers: [AppService, QuizzesService],
})
export class AppModule {}

