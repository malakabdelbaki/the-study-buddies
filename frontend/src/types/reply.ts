import { Types } from 'mongoose';

export interface Reply {
  _id: string;
  user_id: string;
  thread_id: string;
  content: string;
  creator_name: string;
}
