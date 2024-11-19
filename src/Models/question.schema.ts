import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document, Types} from 'mongoose';

export type QuestionDocument = Question & Document;

@Schema({timestamps: true})
export class Question {

  @Prop({ type: Types.ObjectId, ref: 'Quiz', required: true })
  quiz_id: string;// Foreign key to the Quiz schema

  @Prop({required: true})
  question: string;

  @Prop({type:[String],required:false})
  options?:string[];

  @Prop({required:true})
  correct_answer:string;

  @Prop({required:true,enum: ['easy', 'medium', 'hard']})
  difficulty_level: string;

}

export const QuestionSchema = SchemaFactory.createForClass(Question);