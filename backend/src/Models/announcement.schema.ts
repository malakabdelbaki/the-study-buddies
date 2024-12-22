import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AnnouncementDocument = Announcement & Document;

@Schema({ timestamps: true }) 
export class Announcement {
  
  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  course_id: Types.ObjectId; 

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  instructor_id: Types.ObjectId; 

  @Prop({ type: String, required: false })
  creator_name: string;

  @Prop({ type: String, required: true })
  content: string; 

}

export const AnnouncementSchema = SchemaFactory.createForClass(Announcement);
