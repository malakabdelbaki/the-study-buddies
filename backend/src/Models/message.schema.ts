import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true })
class Message {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  sender_id: Types.ObjectId;

  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: Date, default: Date.now })
  timestamp: Date;

  @Prop({ type: Types.ObjectId, ref: 'Message', default: null })
  parent_message_id: Types.ObjectId | null; // For nesting messages
}

export const MessageSchema = SchemaFactory.createForClass(Message);
