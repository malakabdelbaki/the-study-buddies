import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document, Types} from 'mongoose';
import {User} from './user.schema';
import { Course } from './course.schema';

export type ProgressDocument = Progress & Document;

@Schema({ timestamps: true })
export class Progress {

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId; // Referencing the User ID 

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  courseId: Types.ObjectId; // Referencing the Course ID 


  //Ensure completionPercentage stays within valid bounds (0 to 100):
  @Prop({ required: true,
    validate: {
      validator: (value: number) => value >= 0 && value <= 100,
      message: 'Completion percentage must be between 0 and 100.',
    },
   })
  completionPercentage: number;


  //lastAccessed is often the current date when a new progress entry is created.This automatically sets the field to the current date if no value is provided
  @Prop({ required: true ,default: () => new Date()})
  lastAccessed: Date;
  
}

//SchemaFactory.createForClass(): Converts the decorated Progress class into a Mongoose schema
export const ProgressSchema = SchemaFactory.createForClass(Progress);


// Add unique index for userId and courseId
ProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });