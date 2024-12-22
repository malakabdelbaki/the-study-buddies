import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
} from 'class-validator';
import { CoursesService } from '../../courses/courses.service';
import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';

@ValidatorConstraint({ async: true })
@Injectable()
export class MatchInstructorForCourseValidator implements ValidatorConstraintInterface {
  constructor(
    private readonly CoursesService: CoursesService,
  ) {}
 async validate(courseId: string, args: ValidationArguments) {
  if(!args.object['instructor_id']){
    return true;
  }
    const userId = args.object['instructor_id'];
    const course = await this.CoursesService.findOne(new Types.ObjectId(courseId));
    if (!course) {
      return false; 
    }

    return course.instructor_id._id.toString() === userId; 
  }

  defaultMessage(args: ValidationArguments) {
    return 'The instructor ID does not match the authenticated user.';
  }
}
