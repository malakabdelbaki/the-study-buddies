import {
  Injectable,
  CanActivate,
  ExecutionContext
} from '@nestjs/common';
import { CoursesService } from '../../courses/courses.service';
import { Types } from 'mongoose';
import { WsException } from '@nestjs/websockets';
import { Role } from 'src/enums/role.enum';

@Injectable()
export class InstructorWsGuard implements CanActivate {
  constructor(private readonly coursesService: CoursesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient(); // WebSocket client
    const data = context.switchToWs().getData(); // Data sent with the event

    const userId = client.user?.userid; // Extract user from WebSocket client
    const role = client.user?.role;
    if(role==Role.Student){
      return true;
    }
    
    if (!userId) {
      throw new WsException('Invalid request. Missing user ID.');
    }

    const course_id = data.course_id; // Extract course_id from event data
    if (!course_id) {
      throw new WsException('Invalid request. Missing course ID.');
    }

    // Validate course and instructor
    const course = await this.coursesService.findOne(new Types.ObjectId(course_id));
    if (!course) {
      throw new WsException('Course does not exist.');
    }

    if (course.instructor_id.toString() !== userId) {
      throw new WsException('You are not authorized to perform this action.');
    }

    return true; // Allow the WebSocket event to proceed
  }
}
