import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document, Types} from 'mongoose';
import { Course } from './course.schema';
import { QuizType } from 'src/enums/QuizType.enum';
import { Difficulty } from 'src/enums/difficulty.enum';

export type ModuleDocument = Module & Document;

@Schema({ timestamps: true })
export class Module {
    @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
    course_id: Types.ObjectId; 

    @Prop({type: Types.ObjectId, ref: 'User' ,required:true})
    instructor_id: Types.ObjectId;

    @Prop({ required: true })
    title: string; 
  
    @Prop({ required: false })
    content?: string; 
  
    @Prop({ type: [{ type: Types.ObjectId, ref: 'Resource' }], required: false })
    resources?: Types.ObjectId[];  

    @Prop({required:true,enum: Object.values(QuizType),default:QuizType.MCQ})
    quiz_type: QuizType;

    @Prop({type: [{ type: Types.ObjectId, ref: 'Question' }],required:false})
    question_bank? : Types.ObjectId[];

    @Prop({required:true,enum: Object.values(Difficulty)})
    module_difficulty: Difficulty;

    // New rating field for the module (e.g., rating out of 5)
    @Prop({ type: [Number], default: [] ,required:false}) // Array of ratings given by students
    ratings: number[];

    @Prop({required:true,default:10})
    quiz_length: number; // Number of questions in the quiz
}

export const ModuleSchema = SchemaFactory.createForClass(Module);
