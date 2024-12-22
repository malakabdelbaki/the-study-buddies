export interface User {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: 'student' | 'instructor' | 'admin';
  profilePic?: string;
  createdAt?: Date;
  updatedAt?: Date;
  enrolledCourses?: string[];
  taughtCourses?: string[];
  completedCourses?:string[];
  ratings?:Map<string, number>;

}