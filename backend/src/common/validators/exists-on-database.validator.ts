import { Injectable } from '@nestjs/common';
import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../Models/user.schema'; // Replace with your schema path
import { Course, CourseDocument } from 'src/Models/course.schema';
import { Thread, ThreadDocument } from 'src/Models/thread.schema';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import { EntityDoesNotExistException } from '../exceptions/EntityDoesNotExist.exception';

interface ExistsOnDatabaseOptions {
  modelName: string;
  column: string;
}

@Injectable()
@ValidatorConstraint({ name: 'existsOnDatabase', async: true })
export class ExistsOnDatabaseValidator implements ValidatorConstraintInterface {
  constructor(@InjectConnection() private readonly connection: Connection) {
    if (!connection) {
      console.error('Mongoose connection is undefined in ExistsValidator');
    } else {
      console.log('Mongoose connection established in ExistsValidator');
    }
  }

  async validate(value: any, args: ValidationArguments): Promise<boolean> {
    const [modelName, fieldName = '_id'] = args.constraints;
    const model = this.connection.model(modelName);
    if(!model) {
      throw new Error(`Model ${modelName} not found`);
    }


    if (!Types.ObjectId.isValid(value)) {
      return false; // Invalid ObjectId
    }

    const exists = await model.exists({ [fieldName]: new Types.ObjectId(value) });
    if (!exists) {
      throw new EntityDoesNotExistException(modelName, value);
    }

    return true; 
  }

  defaultMessage(args: ValidationArguments): string {
    const options: ExistsOnDatabaseOptions = args.constraints[0];
    const { modelName, column } = options;
    return `The ${column} provided does not exist in the ${modelName} collection.`;
  }

}
