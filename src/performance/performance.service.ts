// import { Injectable } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { Types } from 'mongoose';
// import { Progress, ProgressDocument } from '../Models/progress.schema';
// import { Course, CourseDocument } from '../Models/course.schema';
// import { User, UserDocument } from '../Models/user.schema';
// //import { StudentDashboardDto } from './dto/student-dashboard.dto';
// //import { InstructorAnalyticsDto } from './dto/instructor-analytics.dto';

// type PopulatedCourse = {
//   title: any;
//   _id: string; // MongoDB ObjectId as a string
//   name: string; // Course name field
// };

// // // Define Progress with populated courseId
// // type PopulatedProgress = Omit<Progress, 'courseId'> & {
// //     courseId: PopulatedCourse; // Replace ObjectId with the populated structure
// //   };

// // Define the structure of a populated User
// type PopulatedUser = {
//     _id: Types.ObjectId;
//     name: string; // User's name field
//     email: string; // User's email field
//   };
  
//  // Combined Type for Progress
// type PopulatedProgress = Omit<Progress, 'courseId' | 'userId'> & {
//     courseId: PopulatedCourse;
//     userId: PopulatedUser;
//   };
  
// @Injectable()
// export class PerformanceService {

    
    
//     constructor(
//         @InjectModel(Progress.name) private progressModel: Model<ProgressDocument>,
//         @InjectModel(User.name) private userModel: Model<UserDocument>,
//         @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
//       ) {}
    

    
//     // Fetch the student dashboard
//     async getStudentDashboard(studentId: string) {
//         const progressData = (await this.progressModel
//             .find({ userId: studentId })
//             //The populate() method replaces the courseId field (which is an ObjectId) in the Progress documents with the actual Course document it reference
//             .populate({
//                 path: 'courseId',
//                 select: 'title', // Fetch the 'title' field from Course
//             })) as unknown as PopulatedProgress[]; // Assert that the returned data matches the populated type
//              //Using as unknown effectively bypasses TypeScript's strict type checking, allowing you to manually cast it to the correct type.


      
//         return progressData.map((progress) => ({
//           courseId: progress.courseId._id, // Access the populated courseId
//           courseName: progress.courseId.title, // Access the 'title' field from Course
//           completionPercentage: progress.completionPercentage,
//           lastAccessed: progress.lastAccessed,
//         }));
//       }



// ///////////////////////////////////////////////////////
//     // Get instructor analytics for courses
//     async getInstructorAnalytics(instructorId: string) {
//         const courses = await this.courseModel.find({ instructor_id: instructorId });
        

//         //Ensures all asynchronous operations for all courses are executed in parallel.Returns a single promise that resolves when all promises in the array have resolved.
//         const analytics = await Promise.all(
//           courses.map(async (course) => {
//             // Query progress data
//             const progressData = (await this.progressModel
//                 .find({ courseId: course._id })
//                 .populate({
//                     path: 'userId',
//                     select: 'name email',
//                 })
//                 .populate({
//                     path: 'courseId',
//                     select: 'title',
//                 })) as unknown as PopulatedProgress[];
      
//             if (!progressData.length) {
//               return {
//                 courseId: course._id,
//                 courseTitle: course.title,
//                 totalStudents: 0,
//                 averageCompletion: 0,
//                 lowPerformingStudents: [],
//               };
//             }
      
//             // Calculate analytics
//             const lowPerformingStudents = progressData
//               .filter((p) => p.completionPercentage < 50)
//               .map((p) => ({
//                 studentId: p.userId._id,
//                 studentName: p.userId.name,
//                 email: p.userId.email,
//                 completionPercentage: p.completionPercentage,
//               }));
      
//             const averageCompletion =
//               progressData.reduce((sum, p) => sum + p.completionPercentage, 0) /
//               progressData.length;
      
//             return {
//               courseId: course._id,
//               courseTitle: course.title,
//               totalStudents: progressData.length,
//               averageCompletion: parseFloat(averageCompletion.toFixed(2)),
//               lowPerformingStudents,
//             };
//           }),
//         );
      
//         return analytics;
//       }


//       /////////////////////////

//   // Generate a downloadable analytics report (e.g., CSV)
//   async generateAnalyticsReport(instructorId: string) {
//     const analytics = await this.getInstructorAnalytics(instructorId);

//     // Convert analytics to CSV format
//     const headers = [
//       'Course ID',
//       'Course Title',
//       'Total Students',
//       'Average Completion (%)',
//       'Low-Performing Students',
//     ];
//     const rows = analytics.map((course) => [
//       course.courseId,
//       course.courseTitle,
//       course.totalStudents,
//       course.averageCompletion,
//       course.lowPerformingStudents
//         .map((student) => `${student.studentName} (${student.email})`)
//         .join('; '),
//     ]);

//     // Combine headers and rows into CSV format
//     const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
//     return csv;
//   }



// }
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Types } from 'mongoose';
import { Progress, ProgressDocument } from '../models/progress.schema';
import { Course, CourseDocument } from '../models/course.schema';
import { User, UserDocument } from '../models/user.schema';
import { StudentProgressDto } from './dto/student-progress.dto';
import { InstructorAnalyticsDto } from './dto/instructor-analytics.dto';

type PopulatedCourse = {
  title: string;
  _id: string; // MongoDB ObjectId as a string
};

type PopulatedUser = {
  _id: Types.ObjectId;
  name: string;
  email: string;
};

type PopulatedProgress = Omit<Progress, 'courseId' | 'userId'> & {
  courseId: PopulatedCourse;
  userId: PopulatedUser;
};

@Injectable()
export class PerformanceService {
  constructor(
    @InjectModel(Progress.name) private progressModel: Model<ProgressDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
  ) {}

  // Fetch the student dashboard
  async getStudentDashboard(studentId: string): Promise<StudentProgressDto[]> {
    const progressData = (await this.progressModel
      .find({ userId: studentId })
      .populate({ path: 'courseId', select: 'title' })) as unknown as PopulatedProgress[];

    return progressData.map((progress) => ({
      courseId: progress.courseId._id,
      courseName: progress.courseId.title,
      completionPercentage: progress.completionPercentage,
      lastAccessed: progress.lastAccessed,
    }));
  }

  // Get instructor analytics for courses
  async getInstructorAnalytics(instructorId: string): Promise<InstructorAnalyticsDto[]> {
    const courses = await this.courseModel.find({ instructor_id: instructorId });
  
    const analytics = await Promise.all(
      courses.map(async (course) => {
        const progressData = (await this.progressModel
          .find({ courseId: course._id })
          .populate({ path: 'userId', select: 'name email' })
          .populate({ path: 'courseId', select: 'title' })) as unknown as PopulatedProgress[];
  
        if (!progressData.length) {
          return {
            courseId: course._id.toString(), // Explicitly cast to string
            courseTitle: course.title,
            totalStudents: 0,
            averageCompletion: 0,
            lowPerformingStudents: [],
          };
        }
  
        const lowPerformingStudents = progressData
          .filter((p) => p.completionPercentage < 50)
          .map((p) => ({
            studentId: p.userId._id.toString(), // Explicitly cast to string
            studentName: p.userId.name,
            email: p.userId.email,
            completionPercentage: p.completionPercentage,
          }));
  
        const averageCompletion =
          progressData.reduce((sum, p) => sum + p.completionPercentage, 0) / progressData.length;
  
        return {
          courseId: course._id.toString(), // Explicitly cast to string
          courseTitle: course.title,
          totalStudents: progressData.length,
          averageCompletion: parseFloat(averageCompletion.toFixed(2)),
          lowPerformingStudents,
        };
      }),
    );
  
    return analytics;
  }
  
  // Generate a downloadable analytics report (e.g., CSV)
  async generateAnalyticsReport(instructorId: string): Promise<string> {
    const analytics = await this.getInstructorAnalytics(instructorId);

    const headers = [
      'Course ID',
      'Course Title',
      'Total Students',
      'Average Completion (%)',
      'Low-Performing Students',
    ];
    const rows = analytics.map((course) => [
      course.courseId,
      course.courseTitle,
      course.totalStudents,
      course.averageCompletion,
      course.lowPerformingStudents
        .map((student) => `${student.studentName} (${student.email})`)
        .join('; '),
    ]);

    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  }
}
