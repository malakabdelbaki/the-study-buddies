import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from './users.service';
import { UserController } from './users.controller';
import { User, UserSchema } from '../Models/user.schema';
import { Course, CourseSchema } from '../Models/course.schema';
import { Progress, ProgressSchema } from '../Models/progress.schema';
import { Response, ResponseSchema } from '../Models/response.schema';
import { authorizationGuard } from '../auth/guards/authorization.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Course.name, schema: CourseSchema },
      { name: Progress.name, schema: ProgressSchema },
      { name: Response.name, schema: ResponseSchema },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService, authorizationGuard],
  exports: [UserService], // Export the service if it's needed in other modules
})
export class UserModule {}
