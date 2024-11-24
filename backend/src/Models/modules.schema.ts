import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document, Types} from 'mongoose';
import { Course } from './course.schema';

export type ModuleDocument = Module & Document;

@Schema({ timestamps: true })
export class Module {
    @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
    course_id: Types.ObjectId; 

    @Prop({ required: true })
    title: string; 
  
    @Prop({ required: true })
    content: string; 
  
    @Prop({ type: [String], required: false })
    resources?: string[];  
}

export const ModuleSchema = SchemaFactory.createForClass(Module);
