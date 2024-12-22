export interface Announcement {
  _id: string;
  course_id: string;
  instructor_id: string;
  creator_name?: string;
  content: string;
  createdAt: string;
}