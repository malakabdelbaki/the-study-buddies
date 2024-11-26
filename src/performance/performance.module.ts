import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PerformanceService } from './performance.service';
import { PerformanceController } from './performance.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Progress, ProgressSchema } from '../Models/progress.schema';
import { User, UserSchema } from '../Models/user.schema';
import { Course, CourseSchema } from '../Models/course.schema';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Progress.name, schema: ProgressSchema },
      { name: User.name, schema: UserSchema },
      { name: Course.name, schema: CourseSchema },
    ]),
  ],
  providers: [PerformanceService],
  controllers: [PerformanceController]
})
export class PerformanceModule {}
