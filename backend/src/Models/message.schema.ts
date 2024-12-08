import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true })
export class Message {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  sender_id: Types.ObjectId;

  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: Date, default: Date.now })
  timestamp: Date;

  @Prop({ 
    type: Types.ObjectId, 
    ref: 'Chat',  
    required: true,
    index: true
  })
  chat_id: Types.ObjectId;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
