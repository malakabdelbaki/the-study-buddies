export class CourseAnalyticsDto {
    courseId: string;
    courseName: string;
    averageCompletion: number;
    totalStudents: number;
    lowPerformingStudents: Array<{
      studentId: string;
      studentName: string;
      completionPercentage: number;
    }>;
  }
  
  export class InstructorAnalyticsDto {
    instructorId: string;
    analytics: CourseAnalyticsDto[];
  }
  