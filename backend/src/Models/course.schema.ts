import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document, Types} from 'mongoose';
import { Course_diff } from 'src/enums/course-diff.enum';

export type CourseDocument = Course & Document;

@Schema({ timestamps: true })
export class Course{
    @Prop({required: true, unique: true})
    title: string;

    @Prop({required: false})
    description?: string;

    @Prop({required: true})
    category: string;

    @Prop({required: true, enum: Object.values(Course_diff)})
    difficulty_level: string;

    @Prop({type: Types.ObjectId, ref: 'User' ,required: true})
    instructor_id: Types.ObjectId;

    @Prop({type: [{type: Types.ObjectId, ref: 'User' }] ,required: false ,default:[]})
    students?: Types.ObjectId[];

    @Prop({type: [{type: Types.ObjectId, ref: 'Module' }] ,required: false,default:[]})
    modules?: Types.ObjectId[];

    @Prop({defalut:[]})
    key_words : string[];

    // New rating field for the module (e.g., rating out of 5)
    @Prop({
        type: Map,
        of: Number, // The value type (rating) is a number
        default: {},
      })
      ratings: Map<Types.ObjectId, number>;

}

export const CourseSchema = SchemaFactory.createForClass(Course);