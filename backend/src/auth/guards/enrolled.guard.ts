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
export class EnrolledGuard implements CanActivate {
  constructor(private readonly coursesService: CoursesService,
              private readonly moduleService: ModuleService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log("EnrolledGuard");
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userid; // Get logged-in user ID
     if (!userId) {
      throw new HttpException(
        'Invalid request. Missing user ID.',
        HttpStatus.FORBIDDEN,
      );
    }
  
    if(request.user.role !== Role.Student) {
      console.log("User is not a student");
      return true;
    }
  let course_id = request.params.course_id || request.body.course_id;
  let module_id = request.params.module_id || request.body.module_id;
  const quesId = request.params.quesId || request.body.quesId;

   
    if(quesId) {
      const question = await this.moduleService.findQuestion(quesId);
      if (!question) {
        throw new HttpException(
          'Question does not exist.',
          HttpStatus.NOT_FOUND,
        );
      }
      module_id = question.module_id;
    }

    if(module_id) {
    const module = await this.moduleService.findOne(module_id);
    if (!module) {
      throw new HttpException(
        'Module does not exist.',
        HttpStatus.NOT_FOUND,
      );
    }
   course_id = module.course_id;
  }
  if(course_id){
    return this.coursesService.isStudentEnrolledInCourse(course_id, userId);
  }
  return true;
    }
}
