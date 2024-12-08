import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { CoursesService } from '../../courses/courses.service';
import { ModuleService } from '../../module/module.service';
import { Types } from 'mongoose';
import { Role } from 'src/enums/role.enum';

@Injectable()
export class InstructorGuard implements CanActivate {
  constructor(private readonly coursesService: CoursesService,
              private readonly moduleService: ModuleService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log("InstructorGuard");
    const request = context.switchToHttp().getRequest();
    console.log("request", request);
    const userId = request.user?.userid; // Get logged-in user ID
     if (!userId) {
      throw new HttpException(
        'Invalid request. Missing user ID.',
        HttpStatus.FORBIDDEN,
      );
    }
    if(request.user.role !== Role.Instructor) {
      return true;
    }
  
  const course_id = request.params.course_id || request.body.course_id;
  const module_id = request.params.module_id || request.body.module_id;
  const quesId = request.params.quesId || request.body.quesId;
   
    console.log("course_id", course_id);
    if(quesId) {
      const question = await this.moduleService.findQuestion(quesId);
      if (!question) {
        throw new HttpException(
          'Question does not exist.',
          HttpStatus.NOT_FOUND,
        );
      }
      if (question.instructor_id.toString() !== userId) {
        throw new HttpException(
          'You are not authorized to perform this action.',
          HttpStatus.FORBIDDEN,
        );
    }
  }

    if(module_id) {
    const module = await this.moduleService.findOne(module_id);
    if (!module) {
      throw new HttpException(
        'Module does not exist.',
        HttpStatus.NOT_FOUND,
      );
    }
    if (module.instructor_id.toString() !== userId) {
      throw new HttpException(
        'You are not authorized to perform this action.',
        HttpStatus.FORBIDDEN,
      );
    }
  }

    if(course_id) {
    const course = await this.coursesService.findOne(new Types.ObjectId(course_id));
    console.log("course", course);
    if (!course) {
      throw new HttpException(
        'Course does not exist.',
        HttpStatus.NOT_FOUND,
      );
    }

    if (course.instructor_id.toString() !== userId) {
      throw new HttpException(
        'You are not authorized to perform this action.',
        HttpStatus.FORBIDDEN,
      );
    }

  }
  console.log("userId", userId);
  console.log("true");
  return true; // Allow the request to proceed
  }
}
