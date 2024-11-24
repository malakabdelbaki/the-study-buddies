import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReplyDocument = Reply & Document;

@Schema({ timestamps: true })
class Reply {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId; //sender of the reply

  @Prop({ type: Types.ObjectId, ref: 'Thread', required: true })
  thread_id: Types.ObjectId;  // Reference to the parent thread

  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: Types.ObjectId, ref: 'Reply', default: null })
  parent_reply_id: Types.ObjectId | null;  // For nested replies
}

export const ReplySchema = SchemaFactory.createForClass(Reply);
