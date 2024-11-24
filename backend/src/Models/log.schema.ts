import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role } from '../enums/role.enum'; 
import { Log_event } from 'src/enums/log-event.enum';
import { Status } from 'src/enums/status.enum';

export type LogDocument = Log & Document;

@Schema({ timestamps: true })
export class Log extends Document {
  @Prop({ required: true, enum: Object.values(Log_event) })
    eventType: string; // General type of the event
    
  @Prop({ required: true, enum: Object.values(Status) })
    status: string; // Whether it was successful
  
  @Prop({ required: true })
  ipAddress: string; // IP address from which the request originated
  
  @Prop({ required: false })
  username?: string; // Username (if applicable, for failed login attempts)

  @Prop({ required: false, enum: Object.values(Role) })
  userRole?: string;
  
  @Prop({ required: true })
  endpoint: string; // API endpoint being accessed

  @Prop({ required: false })
  attemptedAccess?: string; // Describe the API/resource being accessed, like the http method GET/POST/..
  
  @Prop({ required: false, type: Object })
  requestPayload?: Record<string, any>; // Optional: Captures payload for debugging (avoid sensitive data)
  
  @Prop({ required: false })
  userAgent?: string; // User agent string
  
  @Prop({ required: false, default: false })
  resolved?: boolean; // If the issue was resolved (admin action)
}

export const LogSchema = SchemaFactory.createForClass(Log);
