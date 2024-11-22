import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document, Types} from 'mongoose';
import {Answer, AnswerSchema} from './answer.schema';

//ts will be aware of both the schema's fields and the Mongoose document methods
export type ResponseDocument = Response & Document;

//renamed createdAt to submittedAt, automatically handled by mongoose
@Schema({timestamps: {createdAt: 'submittedAt', updatedAt:false}})
export class Response{
    @Prop({type: Types.ObjectId, ref: 'User', required: true})// references user
    user_id: Types.ObjectId;

    @Prop({type: Types.ObjectId, ref: 'Quiz', required: true})// references quiz
    quiz_id: Types.ObjectId;

    @Prop({ type:[AnswerSchema], required: true})
    answers: Answer[];

    @Prop({ required: true})
    score: number;
}

export const ResponseSchema = SchemaFactory.createForClass(Response);