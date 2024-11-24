import { StudentProgressDto } from './student-progress.dto';

export class StudentDashboardDto {
  studentId: string; // ID of the student
  dashboard: StudentProgressDto[]; // List of courses with progress information
}
