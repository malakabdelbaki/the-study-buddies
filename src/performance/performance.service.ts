import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Progress, ProgressDocument } from '../Models/progress.schema';
import { Course, CourseDocument } from '../Models/course.schema';
import { User, UserDocument } from '../Models/user.schema';
//import { StudentDashboardDto } from './dto/student-dashboard.dto';
//import { InstructorAnalyticsDto } from './dto/instructor-analytics.dto';

type PopulatedCourse = {
  _id: string; // MongoDB ObjectId as a string
  name: string; // Course name field
};

type PopulatedProgress = Progress & {
  courseId: PopulatedCourse; // courseId will be populated with course details
};

@Injectable()
export class PerformanceService {

    
    
    constructor(
        @InjectModel(Progress.name) private progressModel: Model<ProgressDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
      ) {}
    

      

    // Fetch the student dashboard
    async getStudentDashboard(studentId: string) {
        // Perform the query with populate
        const progressData = await this.progressModel
          .find({ userId: studentId })
          .populate({
            path: 'courseId',
            select: 'title', // Fetch only the 'name' field
          })
          .lean(); // Converts to plain JavaScript objects
      
        // Map and format the data
        return progressData.map((progress) => ({
          courseId: progress.courseId._id.toString(), // Convert ObjectId to string
          courseName: progress.courseId.title,         // Access the name field
          completionPercentage: progress.completionPercentage,
          lastAccessed: progress.lastAccessed,
        }));
      }


    // Fetch instructor analytics
  async getInstructorAnalytics(instructorId: string) {
    // Step 1: Get all courses taught by the instructor
    const courses = await this.courseModel.find({ instructorId });
    const courseIds = courses.map((course) => course._id);

    // Step 2: Get all progress entries for these courses
    const progressData = await this.progressModel
      .find({ courseId: { $in: courseIds } })
      .populate({
        path: 'userId', // Populate the userId to get student details
        select: 'firstName lastName', // Fetch only student names
      });

    // Step 3: Aggregate analytics by course
    const analytics = courses.map((course) => {
      const courseProgress = progressData.filter(
        (progress) => String(progress.courseId) === String(course._id),
      );

      const totalStudents = courseProgress.length;
      const averageCompletion =
        courseProgress.reduce(
          (sum, progress) => sum + progress.completionPercentage,
          0,
        ) / (totalStudents || 1);

      const lowPerformingStudents = courseProgress
        .filter((progress) => progress.completionPercentage < 50)
        .map((progress) => ({
          studentId: progress.userId._id.toString(),
          studentName: `${progress.userId.firstName} ${progress.userId.lastName}`,
          completionPercentage: progress.completionPercentage,
        }));

      return {
        courseId: course._id.toString(),
        courseName: course.name,
        totalStudents,
        averageCompletion,
        lowPerformingStudents,
      };
    });

    return analytics;
  }
}
