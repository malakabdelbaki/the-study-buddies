import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { QuizzesService } from './quizzes.service';
import { QuizzesController } from './quizzes.controller';
import { Module as ModuleEntity, ModuleSchema } from 'src/models/modules.schema';
import { Question, QuestionSchema } from 'src/models/question.schema';
import { Course ,CourseSchema } from 'src/models/course.schema';
import { Quiz, QuizSchema } from 'src/models/quiz.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ModuleEntity.name, schema: ModuleSchema },  // Register Module schema
      { name: Question.name, schema: QuestionSchema },   // Register Question schema
      { name: Course.name , schema: CourseSchema },     // Register Course schema
      { name: Quiz.name, schema: QuizSchema },          // Register Quiz schema
    ]),
  ],
  controllers: [QuizzesController], // Attach your QuizzesController
  providers: [QuizzesService], // Register QuizzesService
  exports: [QuizzesService], // Allow other modules to use QuizzesService if needed
})
export class QuizzesModule {}
