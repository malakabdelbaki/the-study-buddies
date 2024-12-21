import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ChatService } from '../../WebSockets/chat/chat.service';
import { Types } from 'mongoose';
import { ChatType } from 'src/enums/chat-type.enum';
import { ChatVisibility } from 'src/enums/chat-visibility.enum';
import { UserService } from 'src/users/users.service';
import { Role } from 'src/enums/role.enum';

@Injectable()
export class IsChatMemberHttpGuard implements CanActivate {
  constructor(
    private readonly chatService: ChatService,
    private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest(); // Get the HTTP request object
    const userId = request.user?.userid; // Extract the user ID from the authenticated request
    const role = request.user?.role; // Extract the user role from the authenticated request
    if (!userId) {
      throw new HttpException('Invalid request. Missing user ID.', HttpStatus.FORBIDDEN);
    }
    console.log(request.body);
    console.log(request.params);
    const chat_id = request.params.chat_id || request.body.chat_id; // Get `chat_id` from params or body
    if (!chat_id) {
      return true; 
    }

    // Validate the chat
    const chat = await this.chatService.getChatByIdOrFail(chat_id);
    if (!chat) {
      throw new HttpException('Chat does not exist.', HttpStatus.NOT_FOUND);
    }

    if(chat.visibility === ChatVisibility.PUBLIC){      
      if( role == Role.Student ){
        const userCourses = await this.userService.getEnrolledCoursesOfStudent(userId);
        console.log(userCourses);
        if(userCourses.some(course => course.id.toString() === chat.course_id.toString())){
          return true;
        }
      }
      if( role == Role.Instructor ){
        const userCourses = await this.userService.getCoursesByInstructor(userId);
        console.log(userCourses);
        if(userCourses.some(course => course.id.toString() === chat.course_id.toString())){
          return true;
        }
      }
    }

    // Check if the user is a participant in the chat
    if (!chat.participants.some((participant) => participant.toString() === userId)) {
      throw new HttpException(
        'You are not authorized to perform this action.',
        HttpStatus.FORBIDDEN,
      );
    }

    return true; // Allow the request to proceed
  }
}
