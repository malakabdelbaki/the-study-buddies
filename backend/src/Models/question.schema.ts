import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document, Types} from 'mongoose';
import { Difficulty } from 'src/enums/difficulty.enum';

export type QuestionDocument = Question & Document;

@Schema({timestamps: true})
export class Question {

  @Prop({ type: Types.ObjectId, ref: 'Quiz', required: true })
  quiz_id: Types.ObjectId;// Foreign key to the Quiz schema

  @Prop({required: true})
  question: string;

  @Prop({type:[String],required:false})
  options?:string[];

  @Prop({required:true})
  correct_answer:string;

  @Prop({required:true,enum: Object.values(Difficulty)})
  difficulty_level: Difficulty;

}

export const QuestionSchema = SchemaFactory.createForClass(Question);