import { Types } from "mongoose";

export interface Forum {
  _id: string;
  title: string;
  description: string;
  created_by: Types.ObjectId;
  course_id: Types.ObjectId;
  threads: Types.ObjectId[];
  isResolved: boolean;
  creator_name: string;
}