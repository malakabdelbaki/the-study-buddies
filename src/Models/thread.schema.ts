import { Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ThreadDocument = Thread & Document;

@Schema({ timestamps: true })
class Thread {
  
  @Prop({ type: [Types.ObjectId], ref: 'User', required: true }) // Multiple users can participate
  participants: Types.ObjectId[];

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: [Types.ObjectId], ref: 'Reply', default: [] })  // Array of references to Reply model
  replies: Types.ObjectId[];

}

export const ThreadSchema = SchemaFactory.createForClass(Thread);
