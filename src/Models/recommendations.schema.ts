import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types} from 'mongoose';

export type RecommendationDocument = Recommendation & Document;

@Schema({ timestamps: true }) 
export class Recommendation {
 
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId; 

  @Prop({ type: [Types.ObjectId], ref: 'Course', required: true })
  recommendedCourses: Types.ObjectId[]; 

  @Prop({ type: [Types.ObjectId], ref: 'Module', required: true })
  recommendedModules: Types.ObjectId[]; 

  @Prop({ default: Date.now })
  generatedAt: Date; 
}

export const RecommendationSchema = SchemaFactory.createForClass(Recommendation);
