export interface User {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: 'student' | 'instructor' | 'admin';
  profilePictureUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
  enrolledCourses?: string[];
  taughtCourses?: string[];
  completedCourses?:string[];
  ratings?:Map<string, number>;
  averageGrade?:number;

}