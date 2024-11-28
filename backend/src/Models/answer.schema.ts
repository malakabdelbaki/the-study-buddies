import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document, Types} from 'mongoose';
import { SelectedAnswer } from 'src/enums/selected-answer.enum';

export type AnswerDocument = Answer & Document;

@Schema()
export class Answer{
    @Prop({type: Types.ObjectId, ref: 'Question', required: true })// references question
    question_id: Types.ObjectId;

    @Prop({required: true, type: String,  enum: SelectedAnswer})
    selectedAnswer: SelectedAnswer;

    @Prop({required: true, default:false})
    isCorrect: boolean;
}

export const AnswerSchema = SchemaFactory.createForClass(Answer);