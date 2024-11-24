export class StudentProgressDto {
    courseId: string; // ID of the course
    courseName: string; // Name of the course
    completionPercentage: number; // Progress in percentage
    lastAccessed: Date; // Last time the course was accessed
  }