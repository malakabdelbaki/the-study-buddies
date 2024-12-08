import { registerDecorator, ValidationOptions } from 'class-validator';
import { MatchInstructorforModuleValidator } from '../validators/instructor-matches-module-instructor.validator';

export function MatchInstructorForModule(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: MatchInstructorforModuleValidator,
    });
  };
}
