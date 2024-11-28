import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ChatDocument = Chat & Document;

@Schema({ timestamps: true })
export class Chat {
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], required: true })
  participants: Types.ObjectId[];

  @Prop({ type:[{ type: Types.ObjectId, ref: 'Message' }], default: [] })
  messages: Types.ObjectId[];

  @Prop({type: String, required: true})
  chat_name: string;

  @Prop({ type: Boolean, required: true, default: false })
  isArchived: boolean;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
