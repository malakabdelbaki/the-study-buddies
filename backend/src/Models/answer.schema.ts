import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document, Types} from 'mongoose';
import { Choice } from 'src/enums/Choice.enum';

export type AnswerDocument = Answer & Document;

@Schema()
export class Answer{
    @Prop({type: Types.ObjectId, ref: 'Question', required: true })// references question
    question_id: Types.ObjectId;

    @Prop({required: true, type: String,  enum: Choice})
    selectedAnswer: Choice;

    @Prop({required: true, default:false})
    isCorrect: boolean;
}

export const AnswerSchema = SchemaFactory.createForClass(Answer);