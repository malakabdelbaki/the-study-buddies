import { Types } from "mongoose";

export interface Module {
    _id?:string;
    course_id?:string; 

    instructor_id?: string;

    title?: string; 
  
    content?: string; 
  
    resources?: Types.ObjectId[];  

    quiz_type?: string;

    question_bank? : Types.ObjectId[];

    module_difficulty?: string;
     ratings?: Map<Types.ObjectId, number>;

    quiz_length?: number; // Number of questions in the quiz
  }