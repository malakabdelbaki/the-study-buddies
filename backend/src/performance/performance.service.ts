
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
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
  //console.log('Received studentId:', studentId);

  // Convert studentId to ObjectId
  const objectIdStudentId = new mongoose.Types.ObjectId(studentId);
  //console.log('Converted studentId to ObjectId:', objectIdStudentId);

  // Fetch raw progress data for debugging
  // const rawProgressData = await this.progressModel.find({});
  // console.log('Raw progress data:', rawProgressData);

  // Perform the query with ObjectId
  const progressData = await this.progressModel
    .find({ userId: objectIdStudentId })
    .populate({ path: 'courseId', select: 'title' }) as unknown as PopulatedProgress[];

  //console.log('Populated progress data:', progressData);

  // Transform and return the response
  return progressData.map((progress) => {
    //console.log('Mapping progress entry:', progress); // Log each mapping
    return {
      courseId: progress.courseId._id,
      courseName: progress.courseId.title,
      completionPercentage: progress.completionPercentage,
      lastAccessed: progress.lastAccessed,
    };
  });
}







  // Get instructor analytics for courses
  async getInstructorAnalytics(instructorId: string): Promise<InstructorAnalyticsDto[]> {
    console.log('Received instructorId:', instructorId);
    
    const objectIdInstructorId = new mongoose.Types.ObjectId(instructorId);
    const courses = await this.courseModel.find({ instructor_id: objectIdInstructorId });
    console.log('Courses for instructor:', courses);



    const analytics = await Promise.all(
      courses.map(async (course) => {
        console.log('Fetching progress for course:', course._id);
        
        const progressData = (await this.progressModel
          .find({ courseId: course._id })
          .populate({ path: 'userId', select: 'name email' })
          .populate({ path: 'courseId', select: 'title' })) as unknown as PopulatedProgress[];
  
          console.log('Populated progress data:', progressData);

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
