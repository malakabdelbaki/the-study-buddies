import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document, Types} from 'mongoose';
import { Difficulty } from 'src/enums/difficulty.enum';
import { QuestionType } from 'src/enums/QuestionType.enum';

export type QuestionDocument = Question & Document;

@Schema({timestamps: true})
export class Question {

  @Prop({ type: Types.ObjectId, ref: 'Module', required: true })
  module_id: Types.ObjectId;// Foreign key to the Module schema

  @Prop({type: Types.ObjectId ,ref :'User'})
  instructor_id: Types.ObjectId; // Reference to the instructor who created it

  @Prop({required: true})
  question: string;

  @Prop({type:[String],required:false})
  options?:string[];

  @Prop({required:true})
  correct_answer:string;

  @Prop({required:true,enum: Object.values(Difficulty)})
  difficulty_level: Difficulty;

  @Prop({required:true,enum: Object.values(QuestionType)})
  question_type: QuestionType;

}

export const QuestionSchema = SchemaFactory.createForClass(Question);