import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Types } from 'mongoose';
import { ChatService } from '../chat/chat.service';
import { AuthenticatedSocket } from '../authenticated.socket';

@Injectable()
export class IsChatMemberWsGuard implements CanActivate {
  constructor(private readonly chatService: ChatService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: AuthenticatedSocket = context.switchToWs().getClient();
      const data = context.switchToWs().getData();

      if (!client.user?.userid) {
        throw new WsException('User not authenticated');
      }

      const chatId = this.extractChatId(data);
      if (!chatId) {
        throw new WsException('Chat ID is required');
      }

      const chat = await this.chatService.getChatByIdOrFail(new Types.ObjectId(chatId));
      
      const isParticipant = chat.participants.some(
        p => p.toString() === client.user.userid.toString()
      );

      if (!isParticipant) {
        throw new WsException('User is not a member of this chat');
      }

      return true;
    } catch (error) {
      if (error instanceof WsException) {
        throw error;
      }
      throw new WsException('Failed to verify chat membership');
    }
  }

  private extractChatId(data: any): string | undefined {
    return data.chat_id || data.chatId || (data.room && data.room !== 'global' ? data.room : undefined);
  }
}

