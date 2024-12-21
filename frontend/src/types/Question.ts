import { Types } from "mongoose";

export type Question = {
    _id?:string;
    module_id?: string; // Required and unique
    instructor_id?: string; // Required, reference to 'User'
    question?: string; // Required
    difficulty_level?: string; // Required, must match Course_diff enum
    options?: Record<string,string>; // Optional, default is an empty array
    correct_answer?:string;
    question_type?:string;
}

