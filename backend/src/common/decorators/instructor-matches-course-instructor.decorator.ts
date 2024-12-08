import { registerDecorator, ValidationOptions } from 'class-validator';
import { MatchInstructorForCourseValidator } from '../validators/instructor-matches-course-instructor.validator';

export function MatchInstructor(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: MatchInstructorForCourseValidator,
    });
  };
}
