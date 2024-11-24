import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { NotificationType } from '../enums/notification-type.enum';  

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })  
class Notification {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;  // Reference to the User who receives the notification

  @Prop({ type: String, enum: NotificationType, required: true })
  type: NotificationType; // Notification type

  @Prop({ type: String, required: true })
  content: string;  

  @Prop({ type: Types.ObjectId, required: true })
  target_id: Types.ObjectId;  // Reference to the target entity (Message, Announcement, Reply)
 
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
