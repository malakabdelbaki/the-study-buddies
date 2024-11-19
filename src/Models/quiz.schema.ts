import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document, Types} from 'mongoose';
import {Question }from './question.schema'
// import {Module}from './module.schema'; //we didn't make the module yet

export type QuizDocument = Quiz & Document;

@Schema({timestamps: true})
export class Quiz {

    @Prop({ type: Types.ObjectId, ref: 'Module', required: true })
    module_id: string;// Foreign key to the Module schema

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Question' }], default: [] })
    questions: Types.ObjectId[]; // Array of references to the Question schema

}

export const QuizSchema = SchemaFactory.createForClass(Quiz);