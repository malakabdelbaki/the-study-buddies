import {
  Injectable,
  CanActivate,
  ExecutionContext
} from '@nestjs/common';
import { CoursesService } from '../../courses/courses.service';
import { Types } from 'mongoose';
import { WsException } from '@nestjs/websockets';
import { Role } from 'src/enums/role.enum';
import { ChatService } from '../chat/chat.service';

@Injectable()
export class IsChatMemberWsGuard implements CanActivate {
  constructor(private readonly chatService: ChatService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient(); 
    const data = context.switchToWs().getData(); 

    const userId = client.user?.userid; 
    if (!userId) {
      throw new WsException('Invalid request. Missing user ID.');
    }

    const chat_id = data.chat_id; 
    if (!chat_id) {
      throw new WsException('Invalid request. Missing chat ID.');
    }

    // Validate course and instructor
    const chat = await this.chatService.getChatByIdOrFail(new Types.ObjectId(chat_id));
    if (!chat) {
      throw new WsException('chat does not exist.');
    }

    if (!chat.participants.some(p => p.toString() === userId)) {
      throw new WsException('You are not authorized to perform this action.');
    }

    return true; // Allow the WebSocket event to proceed
  }
}
