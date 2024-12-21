import { Types } from "mongoose";

export interface Thread {
  _id: string;
  title: string;
  content: string;
  createdBy: Types.ObjectId;
  forumId: Types.ObjectId;
  replies: Types.ObjectId[];
  isResolved: boolean;
  creator_name: string;
}