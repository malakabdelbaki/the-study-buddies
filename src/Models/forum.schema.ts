import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ForumDocument = Forum & Document;

// Forum Schema
@Schema({ timestamps: true })
export class Forum {
  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  course_id: Types.ObjectId;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: [{Type: Types.ObjectId}], default: [] })
  threads: Types.ObjectId[];

  @Prop({ type: String, required: true })
  description: string;  

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  created_by: Types.ObjectId;

  @Prop({ type: Boolean, default: true })
  is_active: boolean;
}

export const ForumSchema = SchemaFactory.createForClass(Forum);
