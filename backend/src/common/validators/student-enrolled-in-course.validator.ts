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
export class StudentEnrolledInCourseValidator implements ValidatorConstraintInterface {
  constructor(
    private readonly CoursesService: CoursesService,
  ) {}
 async validate(courseId: string, args: ValidationArguments) {
   
    const userId = args.object['user_id'] || args.object['student_id'];
    const course = await this.CoursesService.findOne(new Types.ObjectId(courseId));
    if (!course) {
      return false; 
    }

    return course.students.some(student => student.toString() === userId);
  }

  defaultMessage(args: ValidationArguments) {
    return 'The student is not enrolled.';
  }
}
