export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'instructor';
  enrolledCourses?: string[];
  taughtCourses?: string[];
}