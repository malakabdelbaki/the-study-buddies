import { Types } from 'mongoose';
import { User } from './User';

export type Course = {
  is_deleted?: boolean;
  _id?:string;
  title?: string; // Required and unique
  description?: string; // Optional
  category?: string; // Required
  difficulty_level?: string; // Required, must match Course_diff enum
  instructor_id?: User; // Required, reference to 'User'
  students?: string[]; // Optional, default is an empty array
  modules?: string[]; // Optional, default is an empty array
  key_words?: string[]; // Optional, default is an empty array
  ratings?: Map<string, number>; // Required, default is an empty Map
  enrolledStudents?: string[];
}