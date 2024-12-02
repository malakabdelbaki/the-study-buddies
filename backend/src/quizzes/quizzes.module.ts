import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { QuizzesService } from './quizzes.service';
import { QuizzesController } from './quizzes.controller';
import { Module as ModuleEntity, ModuleSchema } from 'src/models/modules.schema';
import { Question, QuestionSchema } from 'src/models/question.schema';
import { Course ,CourseSchema } from 'src/models/course.schema';
import { Quiz, QuizSchema } from 'src/models/quiz.schema';
import { Answer, AnswerSchema } from 'src/models/answer.schema';
import { Response, ResponseSchema } from 'src/models/response.schema';
import {User , UserSchema} from 'src/models/user.schema';

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
    ]),
  ],
  controllers: [QuizzesController], // Attach your QuizzesController
  providers: [QuizzesService], // Register QuizzesService
  exports: [QuizzesService], // Allow other modules to use QuizzesService if needed
})
export class QuizzesModule {}
