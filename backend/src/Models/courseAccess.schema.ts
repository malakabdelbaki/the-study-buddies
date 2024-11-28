import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.schema';
import { Course } from './course.schema';

export type CourseAccessDocument = CourseAccess & Document;

@Schema({ timestamps: true })
export class CourseAccess {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  courseId: Types.ObjectId;

  @Prop({ type: Date, required: true })
  accessStart: Date;

  @Prop({ type: Date, required: false })
  accessEnd?: Date;

  @Prop({ type: Number, default: 0 })
  sessionDuration: number;
}

export const CourseAccessSchema = SchemaFactory.createForClass(CourseAccess);
