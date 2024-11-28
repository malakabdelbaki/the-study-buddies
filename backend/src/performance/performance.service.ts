
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { Progress, ProgressDocument } from '../models/progress.schema';
import { Course, CourseDocument } from '../models/course.schema';
import { Quiz, QuizDocument } from '../models/quiz.schema';
import { User, UserDocument } from '../models/user.schema';
import { Module , ModuleDocument } from '../Models/modules.schema';
import { Response, ResponseDocument } from '../models/response.schema';
import { CourseAccess, CourseAccessDocument } from '../models/courseAccess.schema';
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

// Type for Populated Module (after populating course_id)
 type PopulatedModule = Omit<Module, 'course_id'> & {
  course_id: Course; // This tells TypeScript that `module_id` will have a `course_id` populated
};

// Type for Populated Quiz
 type PopulatedQuiz = Omit<Quiz, 'module_id'> & {
  module_id: PopulatedModule; // This tells TypeScript that `module_id` will be populated as a `PopulatedModule`
  _id: Types.ObjectId;
};

@Injectable()
export class PerformanceService {
  constructor(
    @InjectModel(Progress.name) private progressModel: Model<ProgressDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(Quiz.name) private quizModel: Model<QuizDocument>, // Inject Quiz model
    @InjectModel(Response.name) private responseModel: Model<ResponseDocument>, // Inject Response model
    @InjectModel(Module.name) private ModuleModel: Model<ModuleDocument>, // Inject Response model
    @InjectModel(CourseAccess.name) private courseAccessModel: Model<CourseAccess>
  ) {}

// Calculate Frequency of Course Access within a specified time range
async calculateAccessFrequency(studentId: string, courseId: string, days: number): Promise<number> {
  const objectIdStudentId = new mongoose.Types.ObjectId(studentId);
  const objectIdCourseId = new mongoose.Types.ObjectId(courseId);

  // Get the date range for the past `days` days
  const dateFrom = new Date();
  dateFrom.setDate(dateFrom.getDate() - days);

  // Query to find access logs for this course and student within the specified date range
  const accessLogs = await this.courseAccessModel.find({
    userId: objectIdStudentId,
    courseId: objectIdCourseId,
    accessStart: { $gte: dateFrom },
  }).exec();

  // Frequency is just the number of times the student accessed the course
  return accessLogs.length;
}

// Calculate Total Time Spent on a Course
async calculateTotalTimeSpent(studentId: string, courseId: string): Promise<number> {
  const objectIdStudentId = new mongoose.Types.ObjectId(studentId);
  const objectIdCourseId = new mongoose.Types.ObjectId(courseId);

  // Query all course access records
  const courseAccesses = await this.courseAccessModel.find({
    userId: objectIdStudentId,
    courseId: objectIdCourseId,
  }).exec();

  // Sum up all session durations to calculate total time spent on the course
  const totalTimeSpent = courseAccesses.reduce((total, access) => total + access.sessionDuration, 0);

  return totalTimeSpent; // Time spent in minutes
}

// Calculate Consistency in Access (how often the student accessed the course over the last `days` days)
async calculateAccessConsistency(studentId: string, courseId: string, days: number): Promise<number> {
  const objectIdStudentId = new mongoose.Types.ObjectId(studentId);
  const objectIdCourseId = new mongoose.Types.ObjectId(courseId);

  // Get the date range for the last `days` days
  const dateFrom = new Date();
  dateFrom.setDate(dateFrom.getDate() - days);

  // Query to find all access logs for the course in the specified date range
  const accessLogs = await this.courseAccessModel.find({
    userId: objectIdStudentId,
    courseId: objectIdCourseId,
    accessStart: { $gte: dateFrom },
  }).exec();

  // Analyze access patterns to determine consistency
  const accessDates = accessLogs.map(access => access.accessStart.toISOString().split('T')[0]);
  const uniqueDates = new Set(accessDates);

  // Consistency could be the number of unique days the student accessed the course
  return uniqueDates.size;
}




  // Fetch the student dashboard
async getStudentDashboard(studentId: string): Promise<StudentProgressDto[]> {
  
  // Convert studentId to ObjectId
  const objectIdStudentId = new mongoose.Types.ObjectId(studentId);

  // Perform the query with ObjectId
  const progressData = await this.progressModel
    .find({ userId: objectIdStudentId })
    .populate({ path: 'courseId', select: 'title' }) as unknown as PopulatedProgress[];

    // Step 2: If no progress found for the student, return an empty array
  if (!progressData || progressData.length === 0) {
    return [];
  }
   
   
  const dashboardData = await Promise.all(progressData.map(async (progress) => {
    // Step 3a: Find all modules associated with the current course
    const modules = await this.ModuleModel.find({ course_id: progress.courseId._id }).exec();

    if (!modules.length) {
      return {
        courseId: progress.courseId._id.toString(),
        courseName: progress.courseId.title,
        averageScore: 0,  // If no modules no quizzes ,so score is 0
        completionPercentage: progress.completionPercentage,
        lastAccessed: progress.lastAccessed,
        totalTimeSpent: 0,  // Default value
        frequencyLastWeek: 0,  // Default valu
        consistencyLastMonth: 0,  // Default value
      };
    }

    // Step 3b: Get all quizzes related to the modules of the course
    const quizzes = await this.quizModel.find({ module_id: { $in: modules.map((module) => module._id) } }).exec();
    console.log('Fetched quizzes:', quizzes);
    

    if (!quizzes.length) {
      return {
        courseId: progress.courseId._id.toString(),
        courseName: progress.courseId.title,
        averageScore: 0,  // If no quizzes, score is 0
        completionPercentage: progress.completionPercentage,
        lastAccessed: progress.lastAccessed,
        totalTimeSpent: 0,  // Default value
        frequencyLastWeek: 0,  // Default value
        consistencyLastMonth: 0,  // Default value
      };
    }

    // Step 3c: Get all quiz responses for the student
    const responses = await this.responseModel.find({
      quiz_id: { $in: quizzes.map((quiz) => quiz._id) },
      user_id: objectIdStudentId,
    }).exec();

    console.log('Fetched responses:', responses); // Log the responses

    if (responses.length === 0) {
      console.log('No responses found for this student and quizzes');
      return {
        courseId: progress.courseId._id.toString(),
        courseName: progress.courseId.title,
        averageScore: 0,  // If no responses, score is 0
        completionPercentage: progress.completionPercentage,
        lastAccessed: progress.lastAccessed,
        totalTimeSpent: 0,  // Default value
        frequencyLastWeek: 0,  // Default value
        consistencyLastMonth: 0,  // Default value,
      };
    }
// Step 3d: Calculate the total score and average score for the course
const totalScore = responses.reduce((acc, response) => acc + response.score, 0);
const averageScore = totalScore / responses.length;
// Fetch engagement metrics inside the map function for each course
const courseId = progress.courseId._id.toString();  // Access courseId from the current progress
const totalTimeSpent = await this.calculateTotalTimeSpent(studentId, courseId);
const frequencyLastWeek = await this.calculateAccessFrequency(studentId, courseId, 7); // Last 7 days
const consistencyLastMonth = await this.calculateAccessConsistency(studentId, courseId, 30); // Last 30 days

return {
  courseId: progress.courseId._id.toString(),
  courseName: progress.courseId.title,
  averageScore: parseFloat(averageScore.toFixed(2)),  // Round to 2 decimal places
  completionPercentage: progress.completionPercentage,
  lastAccessed: progress.lastAccessed,
  totalTimeSpent,
  frequencyLastWeek, 
  consistencyLastMonth, 
};
}));

return dashboardData;


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
