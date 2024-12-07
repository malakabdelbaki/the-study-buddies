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
export class MatchInstructorforModuleValidator implements ValidatorConstraintInterface {
  constructor(
    private readonly moduleService: ModuleService,
  ) {}
 async validate(moduleId: string, args: ValidationArguments) {
   
    const userId = args.object['instructor_id'];
    const module = await this.moduleService.findOne(new Types.ObjectId(moduleId));
    if (!module) {
      return false; 
    }

    return module.instructor_id.toString() === userId; 
  }

  defaultMessage(args: ValidationArguments) {
    return 'The instructor ID does not match the authenticated user.';
  }
}
