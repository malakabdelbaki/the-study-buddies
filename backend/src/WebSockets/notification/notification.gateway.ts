import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserService } from '../../users/users.service';
import { ChatService } from '../chat/chat.service';
import { Types } from 'mongoose';
import { ThreadsService } from '../../discussionForum/threads/threads.service';
import { ForumService } from '../../discussionForum/forum/forum.service';
import { CoursesService } from '../../courses/courses.service';

@WebSocketGateway({ cors: true })
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  constructor(private userService: UserService,
    private chatService: ChatService,
    private threadsService: ThreadsService,
    private forumService: ForumService,
    private courseService: CoursesService
  ) {}

  private onlineUsers = new Map<string, string>(); // Map userId to socketId

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.onlineUsers.set(userId, client.id);
    }

  }

  handleDisconnect(client: Socket) {
    const userId = [...this.onlineUsers.entries()].find(([_, socketId]) => socketId === client.id)?.[0];
    if (userId) this.onlineUsers.delete(userId);
  }

  sendNotification(userId: string, message: string) {
    const socketId = this.onlineUsers.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('notification', message);
    }
  }

}
