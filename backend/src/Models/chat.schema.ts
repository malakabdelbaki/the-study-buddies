import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ChatType } from '../enums/chat-type.enum';

export type ChatDocument = Chat & Document;

@Schema({ timestamps: true })
export class Chat {

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  course_id: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], required: true })
  participants: Types.ObjectId[];

  @Prop({ type:[{ type: Types.ObjectId, ref: 'Message' }], default: [] })
  messages: Types.ObjectId[];

  @Prop({type: String, required: true})
  chat_name: string;

  @Prop({ type: Boolean, required: true, default: false })
  isArchived: boolean;

  @Prop({ type: String, required: true, enum: Object.values(ChatType) })
  chat_type: ChatType;

}

export const ChatSchema = SchemaFactory.createForClass(Chat);
