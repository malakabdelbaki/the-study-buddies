
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
import {Answer, AnswerDocument } from '../models/answer.schema'
import { StudentProgressDto } from './dto/student-progress.dto';
import { InstructorAnalyticsDto } from './dto/instructor-analytics.dto';
import { StudentQuizResultDto ,QuizResultDto } from './dto/quiz-result.dto';


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










  // Get instructor analytics for course (student engagement)
  async getInstructorAnalytics(instructorId: string): Promise<InstructorAnalyticsDto[]> {
    console.log('Received instructorId:', instructorId);
    
    const objectIdInstructorId = new mongoose.Types.ObjectId(instructorId);
    const courses = await this.courseModel.find({ instructor_id: objectIdInstructorId });
    //console.log('Courses for instructor:', courses);



    const analytics = await Promise.all(
      courses.map(async (course) => {
        //console.log('Fetching progress for course:', course._id);
        
        // Fetch progress data for the course
        const progressData = (await this.progressModel
          .find({ courseId: course._id })
          .populate({ path: 'userId', select: 'name email' })
          .populate({ path: 'courseId', select: 'title' })) as unknown as PopulatedProgress[];
  
          //console.log('Populated progress data:', progressData);


      let totalCompletion = 0;
      const completedStudents = progressData.filter(p => p.completionPercentage === 100).length;

      const averageCompletion =
          progressData.reduce((sum, p) => sum + p.completionPercentage, 0) / progressData.length;
  

        if (!progressData.length) {
          // In case no students have enrolled in the course
          return {
            courseId: course._id.toString(),
          courseTitle: course.title,
          totalStudents: 0,
          averageCompletion: 0,
          modulesPerformance: [],
          studentPerformance: { belowAverage: 0, average: 0, aboveAverage: 0, excellent: 0 },
          overallstudentPerformance: { belowAverage: 0, average: 0, aboveAverage: 0, excellent: 0 },
          CompletionPerformanceCategories: { belowAverage: 0, average: 0, aboveAverage: 0, excellent: 0 }
          };
        }

        
        // const lowPerformingStudents = progressData
        //   .filter((p) => p.completionPercentage < 50)
        //   .map((p) => ({
        //     studentId: p.userId._id.toString(), // Explicitly cast to string
        //     studentName: p.userId.name,
        //     email: p.userId.email,
        //     completionPercentage: p.completionPercentage,
        //   }));
        
        


      

       // Categorize students based on their completion percentage
      const CompletionPerformanceCategories = {
        belowAverage: 0,
        average: 0,
        aboveAverage: 0,
        excellent: 0
      }; 
          
          
          // Categorize students into performance categories based on completion rate
         progressData.forEach((p) => {
        totalCompletion += p.completionPercentage;
        if (p.completionPercentage < 50) {
          CompletionPerformanceCategories.belowAverage += 1;
        } else if (p.completionPercentage >= 50 && p.completionPercentage < 70) {
          CompletionPerformanceCategories.average += 1;
        } else if (p.completionPercentage >= 70 && p.completionPercentage < 90) {
          CompletionPerformanceCategories.aboveAverage += 1;
        } else if (p.completionPercentage >= 90) {
          CompletionPerformanceCategories.excellent += 1;
        }
      });


      // Get all modules for the course
      const modules = await this.ModuleModel.find({ course_id: course._id }).exec();

      // Initialize an array to hold module performance data and student performance data
      const modulesPerformance = await Promise.all(
        modules.map(async (module) => {
          console.log('Fetching quizzes for module:', module._id);

          // Get all quizzes for this module
          const quizzes = await this.quizModel.find({ module_id: module._id }).exec();

          // Fetch all students' quiz responses for this module
          const quizResponses = await this.responseModel.find({
            quiz_id: { $in: quizzes.map((quiz) => quiz._id) },
          }).exec();

           // Group quiz responses by student_id
           const studentQuizData: { [studentId: string]: { totalScore: number, quizCount: number } } = {};

          quizResponses.forEach((response) => {
            const studentId = response.user_id.toString();
            if (!studentQuizData[studentId]) {
              studentQuizData[studentId] = { totalScore: 0, quizCount: 0 };
            }
            studentQuizData[studentId].totalScore += response.score;
            studentQuizData[studentId].quizCount += 1;
          });

          // Initialize performance categories for the module
          const performanceCategories  = {
            belowAverage: 0,
            average: 0,
            aboveAverage: 0,
            excellent: 0,
          };

          let totalScore = 0;
          let totalStudents = 0;

          // Categorize students based on their average quiz score for this module
          Object.entries(studentQuizData).forEach(([studentId, data]) => {
            const averageScore = data.totalScore / data.quizCount;
            totalScore += averageScore;
            totalStudents += 1;

            if (averageScore < 50) {
              performanceCategories.belowAverage += 1;
            } else if (averageScore >= 50 && averageScore < 70) {
              performanceCategories.average += 1;
            } else if (averageScore >= 70 && averageScore < 90) {
              performanceCategories.aboveAverage += 1;
            } else {
              performanceCategories.excellent += 1;
            }
          });

          const averageScoreForModule = totalScore / totalStudents;
         
  
        return {
          // courseId: course._id.toString(), // Explicitly cast to string
          // courseTitle: course.title,
          // totalStudents: progressData.length,
          // averageCompletion: parseFloat(averageCompletion.toFixed(2)),
          // completedStudents, // Number of students who completed the course
          
          // //lowPerformingStudents,
          // CompletionPerformanceCategories, // Categorized performance data

          moduleId: module._id.toString(),
          moduleTitle: module.title,
          totalStudents,
          averageScore: parseFloat(averageScoreForModule.toFixed(2)),
          performanceCategories,

        };
      }),
    );

  // Aggregate all student performance data across all modules in the course
  //const studentTotalScore: { [studentId: string]: number } = {}; // To store total scores for each student
  //const studentQuizCount: { [studentId: string]: number } = {}; // To store the total quiz count for each student
  

  // Define an interface for performance categories to ensure consistency

// Aggregate student performance across all modules
const overallstudentPerformance = {
  belowAverage: 0,
  average: 0,
  aboveAverage: 0,
  excellent: 0,
};
  // Initialize student performance categories

  modulesPerformance.forEach((module) => {
    const performanceCategories = module.performanceCategories;
    Object.entries(performanceCategories).forEach(([category, count]) => {
      if (category === 'belowAverage') {
        overallstudentPerformance.belowAverage += count;
      } else if (category === 'average') {
        overallstudentPerformance.average += count;
      } else if (category === 'aboveAverage') {
        overallstudentPerformance.aboveAverage += count;
      } else if (category === 'excellent') {
        overallstudentPerformance.excellent += count;
      }
    });
  });

  // Calculate the overall student performance categories based on module performance
  // const overallstudentPerformance = {
  //   belowAverage: studentPerformance.belowAverage,
  //   average: studentPerformance.average,
  //   aboveAverage: studentPerformance.aboveAverage,
  //   excellent: studentPerformance.excellent,
  // };

  // Return the full analytics object
  return {
    courseId: course._id.toString(),
    courseTitle: course.title,
    totalStudents: progressData.length,
    completedStudents, // Number of students who completed the course
    averageCompletion: parseFloat(averageCompletion.toFixed(2)),
    modulesPerformance,
    overallstudentPerformance,
    //overallstudentPerformance, // New field
    CompletionPerformanceCategories
  };
})
);
  
    return analytics;
  }






  private async calculateAverageScore(responses: ResponseDocument[]): Promise<number> {
    const totalScore = responses.reduce((sum, response) => sum + response.score, 0);
    return parseFloat((totalScore / responses.length).toFixed(2));
  }

  private async getStudentResults(responses: ResponseDocument[]): Promise<StudentQuizResultDto[]> {
    const studentResults: StudentQuizResultDto[] = [];

    for (const response of responses) {

      const student = await this.userModel.findById(response.user_id).exec();


    //   /// Populate the answers field with the referenced Question documents
    //   const populatedResponse = await this.responseModel
    //   .findById(response._id) // Find the response by ID
    //   .populate('answers.question_id') // Populate the question_id reference in answers
    //   .exec()  // This will work now on a document directly.

    // // Map over the populated answers and extract relevant fields
    // const mappedAnswers = populatedResponse.answers.map((answer) => ({
    //   questionId: answer.question_id._id.toString(), // Assuming you want the question ID
    //   selectedAnswer: answer.selectedAnswer,
    //   isCorrect: answer.isCorrect,
    // }));

      studentResults.push({
        studentId: student._id.toString(),
        studentName: student.name,
        score: response.score,
        answers: response.answers.map(answer => answer.toString()), // Assuming `answers` is an array of strings
      });
    }

    return studentResults;
  }

  async getQuizResultsReport(instructorId: string): Promise<QuizResultDto[]> {
    const objectIdInstructorId = new mongoose.Types.ObjectId(instructorId);

    console.log('Instructor ID:', objectIdInstructorId);
    // Find all quizzes created by this instructor
    const quizzes = await this.quizModel
      .find({ createdBy: objectIdInstructorId })
      .populate('questions') // Populate any necessary question details if needed
      .exec();

      console.log('Quizzes:', quizzes);

    const reports: QuizResultDto[] = [];

    // Process each quiz and get responses and results
    for (const quiz of quizzes) {
      const responses = await this.responseModel
        .find({ quiz_id: quiz._id })
        .populate('user_id') // Populate the student data for quiz results
        .exec();

        console.log('Responses:', responses);
      const averageScore = await this.calculateAverageScore(responses);
      const studentResults = await this.getStudentResults(responses);

      reports.push({
        quizId: quiz._id.toString(),
        quizTitle: quiz.title,
        totalQuestions: quiz.questions.length,
        totalStudents: responses.length,
        averageScore,
        studentResults,
      });
    }

    return reports;
  }







  //helper function to calculate the average rating of an array of ratings
  private calculateAverageRating(ratings: number[]): number {
    if (ratings.length === 0) return 0;
    const total = ratings.reduce((sum, rating) => sum + rating, 0);
    return parseFloat((total / ratings.length).toFixed(2));
  }

  async getContentEffectivenessReport(instructorId: string): Promise<any> {
    
    // Step 1: Find all courses for this instructor
    const courses = await this.courseModel.find({ instructor_id: instructorId}).populate('modules').exec();
  
    const reports = [];
  
    // Step 2: Loop through each course and its modules to get ratings
    for (const course of courses) {
      let courseRatings = course.ratings; // Course ratings
      const courseRating = this.calculateAverageRating(courseRatings); // Calculate course rating
  
      const modulesReport = [];
  
      // Step 3: Loop through each module in the course and get ratings
      for (const moduleId of course.modules) {
        const module = await this.ModuleModel.findById(moduleId);
        const moduleRating = this.calculateAverageRating(module.ratings); // Calculate module rating
  
        modulesReport.push({
          moduleId: module._id.toString(),
          moduleTitle: module.title,
          moduleRating,
        });
      }
  
      // Step 4: Get instructor's average rating (based on course ratings)
      const instructor = await this.userModel.findById(instructorId);
      const instructorRating = this.calculateAverageRating(instructor.ratings); // Calculate instructor rating
  
      reports.push({
        courseId: course._id.toString(),
        courseTitle: course.title,
        courseRating,
        instructorRating,
        modules: modulesReport,
      });
    }
  
    return reports;
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
      course.averageCompletion
      // //course.lowPerformingStudents
      //   .map((student) => `${student.studentName} (${student.email})`)
      //   .join('; '),
    ]);

    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  }
}
