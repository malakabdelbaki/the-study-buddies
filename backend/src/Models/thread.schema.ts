import { Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ThreadDocument = Thread & Document;

@Schema({ timestamps: true })
export class Thread {
  @Prop({ type: Types.ObjectId, ref: 'Forum', required: true })
  forumId: Types.ObjectId;
  
  @Prop({ type:Types.ObjectId, ref: 'User', required: true }) 
  createdBy: Types.ObjectId;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: [Types.ObjectId], ref: 'Reply', default: [] })  // Array of references to Reply model
  replies: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'Module', required: false })  
  module?: Types.ObjectId;

  @Prop({ type: Boolean, default: false })
  isResolved: boolean;
}

export const ThreadSchema = SchemaFactory.createForClass(Thread);
