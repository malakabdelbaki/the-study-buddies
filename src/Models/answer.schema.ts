import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document, Types} from 'mongoose';

export type AnswerDocument = Answer & Document;

@Schema()
export class Answer{
    @Prop({type: Types.ObjectId, ref: 'Question', required: true })// references question
    question_id: string;

    @Prop({required: true,  enum: ['A', 'B', 'C', 'D']})
    selectedAnswer: string;

    @Prop({required: true, default:false})
    isCorrect: boolean;
}

export const AnswerSchema = SchemaFactory.createForClass(Answer);