import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserInteractionDocument = UserInteraction & Document;

@Schema({ timestamps: true }) 
export class UserInteraction {
 
  @Prop({type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId; 

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  courseId: Types.ObjectId; 

  @Prop({ type: Types.ObjectId, ref: 'Module', required: true })
  moduleId: Types.ObjectId; 

  @Prop({ type: Number, required: true })
  score: number; 
  
  @Prop({ required: true, default: 0 })
  averageScorePerDifficulty: { easy: number; medium: number; hard: number };


  @Prop({ type: Number, required: true })
  timeSpentMinutes: number; 

  @Prop({ default: Date.now })
  lastAccessed: Date; 
}

export const UserInteractionSchema = SchemaFactory.createForClass(UserInteraction);
