
import { Injectable , NotFoundException,ForbiddenException, InternalServerErrorException, BadRequestException} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { Progress, ProgressDocument } from '../models/progress.schema';
import { Course, CourseDocument } from '../models/course.schema';
import { Quiz, QuizDocument } from '../models/quiz.schema';
import { User, UserDocument } from '../models/user.schema';
import { Module , ModuleDocument } from '../Models/modules.schema';
import { Response, ResponseDocument } from '../models/response.schema';
import {Answer, AnswerDocument } from '../models/answer.schema'
import { StudentProgressDto } from './dto/student-progress.dto';
import { InstructorAnalyticsDto } from './dto/instructor-analytics.dto';
import { StudentQuizResultDto ,QuizResultDto } from './dto/quiz-result.dto';
import * as fs from 'fs';
import * as path from 'path';
import { Parser } from 'json2csv'; // For CSV conversion


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
    
  ) {}







//  Fetch the student dashboard
async getStudentDashboard(studentId: string): Promise<StudentProgressDto[]> {
  try {
    // Validate and convert studentId to ObjectId
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      throw new NotFoundException('Invalid student ID format');
    }

    const objectIdStudentId = new mongoose.Types.ObjectId(studentId);

    // Verify the user role if not student
    const user = await this.userModel.findById(objectIdStudentId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.role !== 'student') {
      throw new ForbiddenException('This dashboard is only accessible for students');
    }

    // Fetch progress data
    const progressData = await this.progressModel
      .find({ userId: objectIdStudentId })
      .populate({ path: 'courseId', select: 'title' }) as unknown as PopulatedProgress[];

    // Handle case where no progress data is found
    if (!progressData || progressData.length === 0) {
      throw new NotFoundException('No progress data found for the student');
    }

    const dashboardData = await Promise.all(progressData.map(async (progress) => {
      try {
        // Find all modules associated with the current course
        const modules = await this.ModuleModel.find({ course_id: progress.courseId._id }).exec();

        if (!modules.length) {
          return {
            courseId: progress.courseId._id.toString(),
            courseName: progress.courseId.title,
            averageScore: 0,
            completionPercentage: progress.completionPercentage,
            lastAccessed: progress.lastAccessed,
          };
        }

        // Get all quizzes related to the modules of the course
        const quizzes = await this.quizModel.find({ module_id: { $in: modules.map((module) => module._id) } }).exec();

        if (!quizzes.length) {
          return {
            courseId: progress.courseId._id.toString(),
            courseName: progress.courseId.title,
            averageScore: 0,
            completionPercentage: progress.completionPercentage,
            lastAccessed: progress.lastAccessed,
          };
        }

        // Get all quiz responses for the student
        const responses = await this.responseModel.find({
          quiz_id: { $in: quizzes.map((quiz) => quiz._id) },
          user_id: objectIdStudentId,
        }).exec();

        if (responses.length === 0) {
          return {
            courseId: progress.courseId._id.toString(),
            courseName: progress.courseId.title,
            averageScore: 0,
            completionPercentage: progress.completionPercentage,
            lastAccessed: progress.lastAccessed,
          };
        }

        // Calculate the total score and average score for the course
        const totalScore = responses.reduce((acc, response) => acc + response.score, 0);
        const averageScore = totalScore / responses.length;

        return {
          courseId: progress.courseId._id.toString(),
          courseName: progress.courseId.title,
          averageScore: parseFloat(averageScore.toFixed(2)),
          completionPercentage: progress.completionPercentage,
          lastAccessed: progress.lastAccessed,
        };
      } catch (error) {
        //An InternalServerErrorException is thrown with a detailed message to help with debugging for  unexpected internal error
        throw new InternalServerErrorException(`Error processing course data: ${error.message}`);
      }
    }));

    return dashboardData;
  } catch (error) {
    if (error instanceof NotFoundException) {
      throw error;
    }
    throw new InternalServerErrorException(`Error fetching student dashboard: ${error.message}`);
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////







  // Get instructor analytics for course (student engagement)
  async getInstructorAnalytics(instructorId: string): Promise<InstructorAnalyticsDto[]> {
    
    try {
    if (!mongoose.Types.ObjectId.isValid(instructorId)) {
      throw new BadRequestException('Invalid instructor ID format'); // Added validation
    }
    
    const objectIdInstructorId = new mongoose.Types.ObjectId(instructorId);
    // Fetch user details to validate the role
    const instructor = await this.userModel.findById(objectIdInstructorId).exec();
    if (!instructor) {
      throw new NotFoundException('Instructor not found');
    }
    if (instructor.role !== 'instructor') {
      throw new ForbiddenException('The provided ID does not belong to an instructor');
    }

    // Fetch courses for the instructor
    const courses = await this.courseModel.find({ instructor_id: objectIdInstructorId });
    if (!courses || courses.length === 0) {
      throw new NotFoundException('No courses found for the instructor'); // Added error handling for empty courses
    }
    //console.log('Courses for instructor:', courses);



    const analytics = await Promise.all(
      courses.map(async (course) => {
        //console.log('Fetching progress for course:', course._id);
        try {//Error Handling for Each Course
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
          completedStudents: 0,
          modulesPerformance: [],
          studentPerformance: { belowAverage: 0, average: 0, aboveAverage: 0, excellent: 0 },
          overallstudentPerformance: { belowAverage: 0, average: 0, aboveAverage: 0, excellent: 0 },
          CompletionPerformanceCategories: { belowAverage: 0, average: 0, aboveAverage: 0, excellent: 0 }
          };
        }

   

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
       
          try { // error handling each module
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

          moduleId: module._id.toString(),
          moduleTitle: module.title,
          totalStudents,
          averageScore: parseFloat(averageScoreForModule.toFixed(2)),
          performanceCategories,

        };
      } catch (moduleError) {
        throw new InternalServerErrorException(`Error processing module: ${module.title}`);
      }
      }),
    );



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


  // Return the full analytics object
  return {
    courseId: course._id.toString(),
    courseTitle: course.title,
    totalStudents: progressData.length,
    completedStudents, // Number of students who completed the course (100% compltion rate)
    averageCompletion: parseFloat(averageCompletion.toFixed(2)),
    modulesPerformance,
    overallstudentPerformance,
    CompletionPerformanceCategories
  };
} catch (courseError) {
  throw new InternalServerErrorException(`Error processing course: ${course.title}`); // Added specific error handling for courses
}
})
);
  
    return analytics;
  } catch (error) {
    if (error instanceof NotFoundException || error instanceof BadRequestException) {
      throw error;
    }
    throw new InternalServerErrorException(`Error fetching instructor analytics: ${error.message}`);
  }
  }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




  private async calculateAverageScore(responses: ResponseDocument[]): Promise<number> {
    const totalScore = responses.reduce((sum, response) => sum + response.score, 0);
    return parseFloat((totalScore / responses.length).toFixed(2));
  }

  private async getStudentResults(responses: ResponseDocument[]): Promise<StudentQuizResultDto[]> {
    const studentResults: StudentQuizResultDto[] = [];

    for (const response of responses) {

      const student = await this.userModel.findById(response.user_id).exec();

      studentResults.push({
        studentId: student._id.toString(),
        studentName: student.name,
        score: response.score,
    
      });
    }

    return studentResults;
  }

  async getQuizResultsReport(instructorId: string): Promise<QuizResultDto[]> {
    try {

    if (!mongoose.Types.ObjectId.isValid(instructorId)) {
      throw new BadRequestException('Invalid instructor ID format');
    }
    const objectIdInstructorId = new mongoose.Types.ObjectId(instructorId);

    // Check if the user is an instructor
    const instructor = await this.userModel.findById(objectIdInstructorId).exec();
    if (!instructor) {
      throw new NotFoundException('Instructor not found');
    }

    if (instructor.role !== 'instructor') {
      throw new ForbiddenException('The provided ID does not belong to an instructor');
    }

    // Find all quizzes created by this instructor
    const quizzes = await this.quizModel
      .find({ createdBy: objectIdInstructorId })
      .populate('questions') // Populate any necessary question details if needed
      .exec();

      if (!quizzes || quizzes.length === 0) {
        throw new NotFoundException('No quizzes found for the instructor');
      }

    const reports: QuizResultDto[] = [];

    // Process each quiz and get responses and results
    for (const quiz of quizzes) {
      const responses = await this.responseModel
        .find({ quiz_id: quiz._id })
        .populate('user_id') // Populate the student data for quiz results
        .exec();
      

    
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
  } catch (error) {
    if (
      error instanceof NotFoundException ||
      error instanceof BadRequestException ||
      error instanceof ForbiddenException
    ) {
      throw error;
    }
    throw new InternalServerErrorException(`Error fetching quiz results report: ${error.message}`);
  }
  }

  

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////






  //helper function to calculate the average rating of an array of ratings
  private calculateAverageRating(ratings: number[]): number {
    if (ratings.length === 0) return 0;
    const total = ratings.reduce((sum, rating) => sum + rating, 0);
    return parseFloat((total / ratings.length).toFixed(2));
  }
  
  async getContentEffectivenessReport(instructorId: string): Promise<any> {
    try {
      // Validate the instructorId format
      if (!mongoose.Types.ObjectId.isValid(instructorId)) {
        throw new BadRequestException('Invalid instructor ID format');
      }
  
      const objectIdInstructorId = new mongoose.Types.ObjectId(instructorId);
  
      // Validate if the user is an instructor
      const instructor = await this.userModel.findById(objectIdInstructorId).exec();
      if (!instructor) {
        throw new NotFoundException('Instructor not found');
      }
      if (instructor.role !== 'instructor') {
        throw new ForbiddenException('The provided ID does not belong to an instructor');
      }
  
      //Find all courses for this instructor
      const courses = await this.courseModel.find({ instructor_id: objectIdInstructorId })
        .populate('modules')
        .exec();
  
      if (!courses || courses.length === 0) {
        throw new NotFoundException('No courses found for the instructor');
      }
  
      const reports = [];
  
      // Loop through each course and its modules to get ratings
      for (const course of courses) {
        try {
          const courseRatings = Array.from(course.ratings.values());
          const courseRating = this.calculateAverageRating(courseRatings);
  
          const modulesReport = [];
  
          //  Loop through each module in the course and get ratings
          for (const moduleId of course.modules) {
            const module = await this.ModuleModel.findById(moduleId).exec();
            if (!module) {
              throw new NotFoundException(`Module with ID ${moduleId} not found`);
            }
            const moduleRatings = Array.from(module.ratings.values());
            const moduleRating = this.calculateAverageRating(moduleRatings);
            modulesReport.push({
              moduleId: module._id.toString(),
              moduleTitle: module.title,
              moduleRating,
            });
          }
  
          // Calculate the instructor's average rating
          const instructorRatings = Array.from(instructor.ratings.values());
          const instructorRating = this.calculateAverageRating(instructorRatings);
  
          reports.push({
            courseId: course._id.toString(),
            courseTitle: course.title,
            courseRating,
            instructorRating,
            modules: modulesReport,
          });
        } catch (courseError) {
          throw new InternalServerErrorException(
            `Error processing course with ID ${course._id}: ${courseError.message}`
          );
        }
      }
  
      return reports;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(`Error generating content effectiveness report: ${error.message}`);
    }
  }
  


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////








  // async generateDownloadableAnalytics(
  //   instructorId: string,
  //   format: 'csv' | 'json',
  // ): Promise<{ filePath: string; fileName: string }> {
  //   const analytics = await this.getInstructorAnalytics(instructorId);

  //   let fileContent: string;
  //   let fileName: string;

  //   if (format === 'csv') {
  //     const parser = new Parser(); // json2csv library
  //     fileContent = parser.parse(analytics);
  //     fileName = `instructor_analytics_${instructorId}.csv`;
  //   } else {
  //     fileContent = JSON.stringify(analytics, null, 2); // Pretty-print JSON
  //     fileName = `instructor_analytics_${instructorId}.json`;
  //   }

  //   const filePath = path.join(__dirname, '../downloads', fileName);

  //   // Ensure the directory exists
  //   fs.mkdirSync(path.dirname(filePath), { recursive: true });

  //   // Write the file to the filesystem
  //   fs.writeFileSync(filePath, fileContent);

  //   return { filePath, fileName };
  // }




  // async generateDownloadableQuizResults(
  //   instructorId: string,
  //   format: 'csv' | 'json',
  // ): Promise<{ filePath: string; fileName: string }> {
  //   const quizResults = await this.getQuizResultsReport(instructorId);

  //   let fileContent: string;
  //   let fileName: string;

  //   if (format === 'csv') {
  //     const parser = new Parser(); // json2csv library
  //     fileContent = parser.parse(quizResults);
  //     fileName = `quiz_results_${instructorId}.csv`;
  //   } else {
  //     fileContent = JSON.stringify(quizResults, null, 2); // Pretty-print JSON
  //     fileName = `quiz_results_${instructorId}.json`;
  //   }

  //   const filePath = path.join(__dirname, '../downloads', fileName);

  //   // Ensure the directory exists
  //   fs.mkdirSync(path.dirname(filePath), { recursive: true });

  //   // Write the file to the filesystem
  //   fs.writeFileSync(filePath, fileContent);

  //   return { filePath, fileName };
  // }

  // async generateDownloadableContentEffectivenessReport(
  //   instructorId: string,
  //   format: 'csv' | 'json',
  // ): Promise<{ filePath: string; fileName: string }> {
  //   const report = await this.getContentEffectivenessReport(instructorId);

  //   let fileContent: string;
  //   let fileName: string;

  //   if (format === 'csv') {
  //     const parser = new Parser(); // json2csv library
  //     fileContent = parser.parse(report);
  //     fileName = `content_effectiveness_${instructorId}.csv`;
  //   } else {
  //     fileContent = JSON.stringify(report, null, 2); // Pretty-print JSON
  //     fileName = `content_effectiveness_${instructorId}.json`;
  //   }

  //   const filePath = path.join(__dirname, '../downloads', fileName);

  //   fs.mkdirSync(path.dirname(filePath), { recursive: true });
  //   fs.writeFileSync(filePath, fileContent);

  //   return { filePath, fileName };
  // }



  async generateDownloadableAnalytics(
    instructorId: string,
    format: 'csv' | 'json',
  ): Promise<{ filePath: string; fileName: string }> {
    try {
      // Validate the instructor ID
      if (!mongoose.Types.ObjectId.isValid(instructorId)) {
        throw new BadRequestException('Invalid instructor ID format');
      }
  
      // Fetch analytics data
      const analytics = await this.getInstructorAnalytics(instructorId);
      if (!analytics || analytics.length === 0) {
        throw new NotFoundException('No analytics data found for the instructor');
      }
  
      let fileContent: string;
      let fileName: string;
  
      if (format === 'csv') {
        const parser = new Parser();
        fileContent = parser.parse(analytics);
        fileName = `instructor_analytics_${instructorId}.csv`;
      } else {
        fileContent = JSON.stringify(analytics, null, 2);
        fileName = `instructor_analytics_${instructorId}.json`;
      }
  
      const filePath = path.join(__dirname, '../downloads', fileName);
  
      // Ensure the directory exists
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
  
      // Write the file to the filesystem
      fs.writeFileSync(filePath, fileContent);
  
      return { filePath, fileName };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(`Error generating analytics file: ${error.message}`);
    }
  }
  
  async generateDownloadableQuizResults(
    instructorId: string,
    format: 'csv' | 'json',
  ): Promise<{ filePath: string; fileName: string }> {
    try {
      // Validate the instructor ID
      if (!mongoose.Types.ObjectId.isValid(instructorId)) {
        throw new BadRequestException('Invalid instructor ID format');
      }
  
      // Fetch quiz results
      const quizResults = await this.getQuizResultsReport(instructorId);
      if (!quizResults || quizResults.length === 0) {
        throw new NotFoundException('No quiz results found for the instructor');
      }
  
      let fileContent: string;
      let fileName: string;
  
      if (format === 'csv') {
        const parser = new Parser();
        fileContent = parser.parse(quizResults);
        fileName = `quiz_results_${instructorId}.csv`;
      } else {
        fileContent = JSON.stringify(quizResults, null, 2);
        fileName = `quiz_results_${instructorId}.json`;
      }
  
      const filePath = path.join(__dirname, '../downloads', fileName);
  
      // Ensure the directory exists
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
  
      // Write the file to the filesystem
      fs.writeFileSync(filePath, fileContent);
  
      return { filePath, fileName };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(`Error generating quiz results file: ${error.message}`);
    }
  }
  
  async generateDownloadableContentEffectivenessReport(
    instructorId: string,
    format: 'csv' | 'json',
  ): Promise<{ filePath: string; fileName: string }> {
    try {
      // Validate the instructor ID
      if (!mongoose.Types.ObjectId.isValid(instructorId)) {
        throw new BadRequestException('Invalid instructor ID format');
      }
  
      // Fetch content effectiveness report
      const report = await this.getContentEffectivenessReport(instructorId);
      if (!report || report.length === 0) {
        throw new NotFoundException('No content effectiveness data found for the instructor');
      }
  
      let fileContent: string;
      let fileName: string;
  
      if (format === 'csv') {
        const parser = new Parser();
        fileContent = parser.parse(report);
        fileName = `content_effectiveness_${instructorId}.csv`;
      } else {
        fileContent = JSON.stringify(report, null, 2);
        fileName = `content_effectiveness_${instructorId}.json`;
      }
  
      const filePath = path.join(__dirname, '../downloads', fileName);
  
      // Ensure the directory exists
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
  
      // Write the file to the filesystem
      fs.writeFileSync(filePath, fileContent);
  
      return { filePath, fileName };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(`Error generating content effectiveness file: ${error.message}`);
    }
  }  

}

