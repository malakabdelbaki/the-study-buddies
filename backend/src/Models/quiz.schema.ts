import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document, Types} from 'mongoose';
import {Question }from './question.schema'
import {Module}from './modules.schema'; 
import { QuizType } from 'src/enums/QuizType.enum';


export type QuizDocument = Quiz & Document;

@Schema({timestamps: true})
export class Quiz {

    @Prop ({type:String})
    title:String;

    @Prop({ type: Types.ObjectId, ref: 'Module', required: true })
    module_id: Types.ObjectId;// Foreign key to the Module schema

    @Prop({required:true,enum: Object.values(QuizType)})
    quiz_type: QuizType; // enum for the quiz type will be = to module_id.quiz_type

    @Prop({required:true})
    Number_of_questions:Number;
    
    @Prop({ type: [{ type: Types.ObjectId, ref: 'Question' }], default: [] })
    questions: Types.ObjectId[]; // Array of references to the Question schema

    @Prop({type: Types.ObjectId ,ref :'User'})
    createdBy: Types.ObjectId; // Reference to the instructor who created it 

    @Prop({type: Types.ObjectId ,ref :'User'})
    student_id: Types.ObjectId; // Reference to the student who will take the quiz 

}

export const QuizSchema = SchemaFactory.createForClass(Quiz);