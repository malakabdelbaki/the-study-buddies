import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document, Types} from 'mongoose';

//ts will be aware of both the schema's fields and the Mongoose document methods
export type ResourceDocument = Resource & Document;

//renamed createdAt to submittedAt, automatically handled by mongoose
@Schema({timestamps: {updatedAt:true}})
export class Resource{

    @Prop({type: Types.ObjectId, ref: 'Module', required: true})// references quiz
    module_id: Types.ObjectId;

    @Prop({required:true, default:false}) 
    isOutdated :boolean;

    @Prop({required:true})
    title:string;

    @Prop({required:false})
    description:string;

    @Prop({reguired:false})
    type:string;

    @Prop({required:true})
    url:string;

}

export const ResourceSchema = SchemaFactory.createForClass(Resource);