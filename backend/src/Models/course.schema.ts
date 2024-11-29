import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document, Types} from 'mongoose';
import { Course_diff } from 'src/enums/course-diff.enum';

export type CourseDocument = Course & Document;

@Schema({ timestamps: true })
export class Course{
    @Prop({required: true, unique: true})
    title: string;

    @Prop({required: true})
    description: string;

    @Prop({required: true})
    category: string;

    @Prop({required: true, enum: Object.values(Course_diff)})
    difficulty_level: string;

    @Prop({type: Types.ObjectId, ref: 'User' ,required: true})
    instructor_id: Types.ObjectId;

    @Prop({type: [{type: Types.ObjectId, ref: 'User' }] ,required: true ,default:[]})
    students: Types.ObjectId[];

    @Prop({type: [{type: Types.ObjectId, ref: 'Module' }] ,required: true,default:[]})
    modules: Types.ObjectId[];

    @Prop({defalut:[]})
    key_words : string[];

}

export const CourseSchema = SchemaFactory.createForClass(Course);