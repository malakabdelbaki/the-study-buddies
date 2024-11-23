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

  @Prop({ required: true })
  completionPercentage: number;

  @Prop({ required: true })
  lastAccessed: Date;
}

//SchemaFactory.createForClass(): Converts the decorated Progress class into a Mongoose schema
export const ProgressSchema = SchemaFactory.createForClass(Progress);
