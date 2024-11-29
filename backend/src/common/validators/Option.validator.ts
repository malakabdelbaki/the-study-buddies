import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { QuestionType } from 'src/enums/QuestionType.enum';
import { BadRequestException } from '@nestjs/common';

export function IsValidOptions(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsValidOptions',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const questionType = (args.object as any).question_type; // Get the question type from the DTO

          if (typeof value !== 'object' || value === null) {
            throw new BadRequestException(`Options must be a map or object. Received: ${typeof value}`);
          }

          const keys = Object.keys(value); // Get keys from the map/object

          if (questionType === QuestionType.MCQ) {
            // MCQ questions must have exactly 4 options with keys 'a', 'b', 'c', 'd'
            if (keys.length !== 4) {
              throw new BadRequestException(`MCQ questions must have exactly 4 options. Found ${keys.length}.`);
            }

            const validKeys = ['a', 'b', 'c', 'd'];
            const invalidKeys = keys.filter((key) => !validKeys.includes(key));
            if (invalidKeys.length > 0) {
              throw new BadRequestException(
                `Invalid keys for MCQ: Expected 'a', 'b', 'c', 'd', but got ${invalidKeys.join(', ')}.`
              );
            }
          } else if (questionType === QuestionType.TrueOrFalse) {
            // True/False questions must have exactly 2 options with keys 't' and 'f'
            if (keys.length !== 2) {
              throw new BadRequestException('True/False questions must have exactly 2 options.');
            }

            const validKeys = ['t', 'f'];
            const invalidKeys = keys.filter((key) => !validKeys.includes(key));
            if (invalidKeys.length > 0) {
              throw new BadRequestException(
                `Invalid keys for True/False: Expected 't' and 'f', but got ${invalidKeys.join(', ')}.`
              );
            }
          }

          return true; // Validation passed
        },
      },
    });
  };
}
