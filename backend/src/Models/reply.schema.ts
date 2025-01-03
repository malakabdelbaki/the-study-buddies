import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReplyDocument = Reply & Document;

@Schema({ timestamps: true })
export class Reply {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({ type: String, required: false })
  creator_name: string;

  @Prop({ type: Types.ObjectId, ref: 'Thread', required: true })
  thread_id: Types.ObjectId;  
  
  @Prop({ type: String, required: true })
  content: string;

}

export const ReplySchema = SchemaFactory.createForClass(Reply);
