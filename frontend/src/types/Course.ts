import { Types } from 'mongoose';

export type Course = {
  _id?:string;
  title?: string; // Required and unique
  description?: string; // Optional
  category?: string; // Required
  difficulty_level?: string; // Required, must match Course_diff enum
  instructor_id?: Types.ObjectId; // Required, reference to 'User'
  students?: Types.ObjectId[]; // Optional, default is an empty array
  modules?: Types.ObjectId[]; // Optional, default is an empty array
  key_words?: string[]; // Optional, default is an empty array
  ratings?: Map<Types.ObjectId, number>; // Required, default is an empty Map
  enrolledStudents?: string[];
}