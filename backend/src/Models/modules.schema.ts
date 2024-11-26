import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document, Types} from 'mongoose';
import { Course } from './course.schema';
import { QuizType } from 'src/enums/QuizType.enum';

export type ModuleDocument = Module & Document;

@Schema({ timestamps: true })
export class Module {
    @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
    course_id: Types.ObjectId; 

    @Prop({type: Types.ObjectId, ref: 'User' })
    instructor_id: Types.ObjectId;

    @Prop({ required: true })
    title: string; 
  
    @Prop({ required: true })
    content: string; 
  
    @Prop({ type: [String], required: false })
    resources?: string[];  

    @Prop({required:true,enum: Object.values(QuizType)})
    quiz_type: QuizType;
}

export const ModuleSchema = SchemaFactory.createForClass(Module);