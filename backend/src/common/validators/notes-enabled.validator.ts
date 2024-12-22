import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { CoursesService } from 'src/courses/courses.service';
@Injectable()
@ValidatorConstraint({ async: true })
export class IsNoteEnabledConstraint implements ValidatorConstraintInterface {
constructor(
  private readonly CoursesService: CoursesService,
) {}

  async validate(courseId: any, args: ValidationArguments) {

    const course = await this.CoursesService.findOne(courseId);
    if (course && course.isNoteEnabled) {
      return true;
    }
    return false;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Notes are not enabled for the given course.';
  }
}

export function IsNoteEnabled(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsNoteEnabledConstraint,
    });
  };
}