import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document} from 'mongoose';

export type UserDocument = User & Document;
import { Role } from '../enums/role.enum'; 

@Schema({timestamps: true})
export class User {
  @Prop({required: true})
  name: string;

  @Prop({required: true, unique: true})
  email: string;

  @Prop({required: true})
  passwordHash: string;

  @Prop({required: true, enum: Object.values(Role) })
  role: Role;

  @Prop({required: false})
  profilePictureUrl?: string;
  
  // New field to store ratings for the instructor
  @Prop({ type: [Number], default: [] }) // Array of ratings from students
  ratings: number[];

}

export const UserSchema = SchemaFactory.createForClass(User);