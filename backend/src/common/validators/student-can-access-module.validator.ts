import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
} from 'class-validator';
import { CoursesService } from '../../courses/courses.service';
import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { ModuleService } from 'src/module/module.service';

@ValidatorConstraint({ async: true })
@Injectable()
export class StudentCanAccessModuleValidator implements ValidatorConstraintInterface {
  constructor(
    private readonly CoursesService: CoursesService,
    private readonly ModuleService: ModuleService,
  ) {}
 async validate(module_id: string, args: ValidationArguments) {
   
    const userId = args.object['user_id'] || args.object['student_id'];
    const module = await this.ModuleService.findOne(new Types.ObjectId(module_id));
    const course = await this.CoursesService.findOne(module.course_id);
    if (!course) {
      return false; 
    }

    return course.students.some(student => student.toString() === userId);
  }

  defaultMessage(args: ValidationArguments) {
    return 'The student cant access module.';
  }
}
