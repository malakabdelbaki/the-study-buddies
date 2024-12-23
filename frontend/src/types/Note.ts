export interface Note {
  _id: string;
  userId: string;
  courseId: string;
  moduleId: string;
  title: string;
  content: string;
  updatedAt?: Date;
  createdAt?: Date;
}