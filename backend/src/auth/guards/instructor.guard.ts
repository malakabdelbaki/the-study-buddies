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

@Injectable()
export class InstructorGuard implements CanActivate {
  constructor(private readonly coursesService: CoursesService,
              private readonly moduleService: ModuleService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userid; // Get logged-in user ID
     if (!userId) {
      throw new HttpException(
        'Invalid request. Missing user ID.',
        HttpStatus.FORBIDDEN,
      );
    }
  
  const course_id = request.params.course_id || request.body.course_id;
  const module_id = request.params.module_id || request.body.module_id;
  const quesId = request.params.quesId || request.body.quesId;
   
  if(!course_id && !module_id && !quesId) {
    throw new HttpException(
      'Invalid request. Missing course ID or module ID.',
      HttpStatus.BAD_REQUEST,
    );
  }

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
    
  return true; // Allow the request to proceed
  }
}
