import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { QuizzesService } from './quizzes.service';
import { QuizzesController } from './quizzes.controller';
import { Module as ModuleEntity, ModuleSchema } from 'src/Models/modules.schema';
import { Question, QuestionSchema } from 'src/Models/question.schema';
import { Course ,CourseSchema } from 'src/Models/course.schema';
import { Quiz, QuizSchema } from 'src/Models/quiz.schema';
import { Answer, AnswerSchema } from 'src/Models/answer.schema';
import { Response, ResponseSchema } from 'src/Models/response.schema';
import { User , UserSchema} from 'src/Models/user.schema';
import { Progress , ProgressSchema } from 'src/Models/progress.schema';
import { AuthService } from 'src/auth/auth.service';
import { UserModule } from 'src/users/users.module';
import { CoursesModule } from 'src/courses/courses.module';
import { ModuleModule } from 'src/module/module.module';
import { LogsModule } from 'src/log/log.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ModuleEntity.name, schema: ModuleSchema },  // Register Module schema
      { name: Question.name, schema: QuestionSchema },   // Register Question schema
      { name: Course.name , schema: CourseSchema },     // Register Course schema
      { name: Quiz.name, schema: QuizSchema },          // Register Quiz schema
      { name: Answer.name, schema: AnswerSchema },      // Register Answer schema
      { name: Response.name, schema: ResponseSchema }, // Register Response schema
      { name: User.name, schema: UserSchema },         // Register User schema
      { name: Progress.name , schema: ProgressSchema } // Register Progress schema
    ]),
    UserModule,
    CoursesModule,
    ModuleModule,
    LogsModule
  ],
  controllers: [QuizzesController], // Attach your QuizzesController
  providers: [QuizzesService, AuthService], // Register QuizzesService
  exports: [QuizzesService], // Allow other modules to use QuizzesService if needed
})
export class QuizzesModule {}
