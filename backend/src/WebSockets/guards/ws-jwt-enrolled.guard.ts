import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Types } from 'mongoose';
import { CoursesService } from '../../courses/courses.service';
import { AuthenticatedSocket } from '../authenticated.socket';
import { Role } from '../../enums/role.enum';

@Injectable()
export class CourseEnrollmentWsGuard implements CanActivate {
  constructor(private readonly coursesService: CoursesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: AuthenticatedSocket = context.switchToWs().getClient();
      const data = context.switchToWs().getData();

      if (!client.user?.userid) {
        throw new WsException('User not authenticated');
      }

      const courseId = this.extractCourseId(data);
      if (!courseId) {
        throw new WsException('Course ID is required');
      }

      const course = await this.coursesService.findOne(new Types.ObjectId(courseId));
      if (!course) {
        throw new WsException('Course not found');
      }

      // Instructors always have access
      if (client.user.role === Role.Instructor) {
        if (course.instructor_id.toString() === client.user.userid.toString()) {
          return true;
        }
        throw new WsException('Instructor is not assigned to this course');
      }

      // Check student enrollment
      const isEnrolled = course.students.some(
        studentId => studentId.toString() === client.user.userid.toString()
      );

      if (!isEnrolled) {
        throw new WsException('Student is not enrolled in this course');
      }

      return true;
    } catch (error) {
      if (error instanceof WsException) {
        throw error;
      }
      throw new WsException('Failed to verify course enrollment');
    }
  }

  private extractCourseId(data: any): string | undefined {
    return data.course_id || data.courseId;
  }
}

