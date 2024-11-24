import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document, Types} from 'mongoose';
import {Question }from './question.schema'
// import {Module}from './module.schema'; //we didn't make the module yet

export type QuizDocument = Quiz & Document;

@Schema({timestamps: true})
export class Quiz {

    @Prop ({type:String})
    title:String;

    @Prop({ type: Types.ObjectId, ref: 'Module', required: true })
    module_id: Types.ObjectId;// Foreign key to the Module schema

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Question' }], default: [] })
    questions: Types.ObjectId[]; // Array of references to the Question schema

    @Prop({type: Types.ObjectId ,ref :'User'})
    createdBy: Types.ObjectId; // Reference to the instructor who created it

    @Prop({ required: false, type: [{ questionId: Types.ObjectId, difficulty: String }] })
    questionHistory?: { questionId: Types.ObjectId; difficulty: string }[]; // Array of objects that store the question ID and the difficulty level of the question


}

export const QuizSchema = SchemaFactory.createForClass(Quiz);