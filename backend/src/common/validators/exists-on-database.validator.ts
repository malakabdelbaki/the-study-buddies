import { Injectable } from '@nestjs/common';
import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../Models/user.schema'; // Replace with your schema path
import { Course, CourseDocument } from 'src/Models/course.schema';
import { Thread, ThreadDocument } from 'src/Models/thread.schema';

interface ExistsOnDatabaseOptions {
  modelName: string;
  column: string;
}

@Injectable()
@ValidatorConstraint({ name: 'existsOnDatabase', async: true })
export class ExistsOnDatabaseValidator implements ValidatorConstraintInterface {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Course.name) private readonly courseModel: Model<CourseDocument>
  ) {
    console.log("in constructor");
    console.log("userModel: ", userModel);
    console.log("courseModel: ", courseModel);
  }

  async validate(value: any, args: ValidationArguments): Promise<boolean> {
    if (!value) return true; // Allow null or undefined to pass

    const options: ExistsOnDatabaseOptions = args.constraints[0];
    const { modelName, column } = options;

    console.log("modelname: ", modelName, "column: ", column);
    const model = this.getModel(modelName);
    console.log("retreived model ", model);
    if (!model) {
      console.error(`Model ${modelName} not found.`);
      return false;
    }

    // Check if the entity exists
    const exists = await model.exists({ [column]: value });

    return !!exists;
  }

  defaultMessage(args: ValidationArguments): string {
    const options: ExistsOnDatabaseOptions = args.constraints[0];
    const { modelName, column } = options;
    return `The ${column} provided does not exist in the ${modelName} collection.`;
  }

  private getModel(modelName: string): Model<any> | null {
    console.log("modelname in getModel: ", modelName);
    switch (modelName.toLowerCase()) {
      case 'user':
        return this.userModel;
      case 'course':
        return this.courseModel;
      
      // Add more cases for other models
      default:
        return null;
    }
  }
}
