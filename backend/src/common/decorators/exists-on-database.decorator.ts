import { registerDecorator, ValidationOptions } from 'class-validator';
import { ExistsOnDatabaseValidator } from '../validators/exists-on-database.validator';

interface ExistsOnDatabaseOptions {
  modelName: string;
  column: string;
}

/**
 * Decorator for checking if a value exists in a specific database collection.
 */
export function ExistsOnDatabase(
  options: ExistsOnDatabaseOptions,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [options],
      validator: ExistsOnDatabaseValidator,
    });
  };
}
