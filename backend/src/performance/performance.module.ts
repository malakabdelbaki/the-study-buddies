import { Module as NestModule, Res } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PerformanceService } from './performance.service';
import { PerformanceController } from './performance.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Progress, ProgressSchema } from '../Models/progress.schema';
import { User, UserSchema } from '../Models/user.schema';
import { Course, CourseSchema } from '../Models/course.schema';
import { Quiz, QuizSchema } from '../Models/quiz.schema';
import { Response, ResponseSchema } from '../Models/response.schema';
import { Module, ModuleSchema } from '../Models/modules.schema';
import { CourseAccess, CourseAccessSchema } from '../Models/courseAccess.schema';


@NestModule({
  imports: [
    MongooseModule.forFeature([
      { name: Progress.name, schema: ProgressSchema },
      { name: User.name, schema: UserSchema },
      { name: Course.name, schema: CourseSchema },
      { name: Quiz.name, schema: QuizSchema },
      { name: Response.name, schema: ResponseSchema },
      { name: Module.name, schema: ModuleSchema },
      {name: CourseAccess.name, schema:CourseAccessSchema}
    ]),
  ],
  providers: [PerformanceService],
  controllers: [PerformanceController]
})
export class PerformanceModule {}
