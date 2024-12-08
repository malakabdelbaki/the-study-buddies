import { SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, MessageBody, ConnectedSocket, WsResponse , WsException } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io'; 
import { ChatService } from './chat.service';
import { Types } from 'mongoose';
import { UserService } from '../../users/users.service';
import { CreateDirectChatDto } from './dto/create-direct-chat.dto';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../guards/ws-jwt-authentication.guard'; 
import { JwtService } from '@nestjs/jwt';
import { AuthenticatedSocket } from '../authenticated.socket';
import { CoursesService } from 'src/courses/courses.service';
import { WsAuthorizationGuard } from '../guards/ws-jwt-authorization.guard';
import { SetMetadata } from '@nestjs/common';
import { Role } from 'src/enums/role.enum';
import { CreateGroupChatDto } from './dto/create-group-chat.dto';
import { ROLES_KEY } from 'src/auth/decorators/roles.decorator';
import { InstructorWsGuard } from '../guards/ws-jwt-instructor.guard';
import { StudentEnrollmentWsGuard } from '../guards/ws-jwt-enrolled.guard';
import { IsChatMemberWsGuard } from '../guards/ws-jwt-is-chat-member.guard';
import { AddMessageDto } from './dto/AddMessage.dto';
import { AddParticipantDto } from './dto/AddParticipant.dto';
import { LeaveChatDto } from './dto/LeaveChat.dto';
import { NotificationsService } from '../notification/notification.service';
import { NotificationType } from 'src/enums/notification-type.enum';

@WebSocketGateway({
  cors:{
  origin: '*',
  methods: ['GET', 'POST'],
}})
@UseGuards(WsJwtGuard)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(private readonly chatService: ChatService,
              private readonly userService : UserService,
              private readonly coursesService: CoursesService,
              private readonly notificationsService:NotificationsService) {}

  handleConnection(@ConnectedSocket() client: AuthenticatedSocket, ...args: any[]) {
    if (!client.user) {
      throw new WsException('Unauthorized');
    }
    console.log('client connected ', client.id);
  }

  handleDisconnect(@ConnectedSocket() client: AuthenticatedSocket) {
    console.log('client disconnected ', client.id);
  }

  @SubscribeMessage('createGroupChat')
  @UseGuards(WsAuthorizationGuard, InstructorWsGuard, StudentEnrollmentWsGuard)
  @SetMetadata(ROLES_KEY, [Role.Student, Role.Instructor])
  async handleCreateGroupChat(
    @MessageBody() data: { room : string, createChatDto : CreateGroupChatDto}, 
    @ConnectedSocket() client: AuthenticatedSocket
  ) : Promise<WsResponse<any>>{

    console.log('Received data:', data);  
  
    try{
      const userId = client.user; 
      const user = await this.userService.findUserById(userId.toString());
      const newChat = await this.chatService.createGroupChatOrFail(data.createChatDto, userId);
      const course = await this.coursesService.findOne(new Types.ObjectId(data.createChatDto.course_id)); 

      this.server.to(data.room).emit('chatCreated', {
        chatId: (newChat as any)._id,
        chatName: newChat.chat_name,
        studentName: user.name, // Send student name
        course: course.title,
      });
    
    return { event: 'chatCreated', data: newChat };

  } catch (error) {
    console.error('Error creating group chat:', error);
    client.emit('error', { message: 'Failed to create group chat.' });
    }
  }

  @SubscribeMessage('createDirectChat')
  @UseGuards(WsAuthorizationGuard,  InstructorWsGuard, StudentEnrollmentWsGuard)
  @SetMetadata(ROLES_KEY, [Role.Student, Role.Instructor])
  async handleCreateDirectChat(
  @MessageBody() data: { room : string, createDirectChatdto : CreateDirectChatDto}, 
  @ConnectedSocket() client: AuthenticatedSocket) : Promise<WsResponse<any>>{
    
    try{

    const userId = client.user;
    const user = await this.userService.findUserById(userId.toString());

    const newChat = await this.chatService.createDirectChatOrFail(data.createDirectChatdto, userId);

      this.server.to(data.room).emit('chatCreated', {
        chat_id: (newChat as any)._id,
        chatName: newChat.chat_name,
        studentName: user.name, // Send student name
      });
  
    return { event: 'chatCreated', data: newChat };
  }
  catch (error) {
    console.error('Error creating direct chat:', error);
    client.emit('error', { message: 'Failed to create direct chat.' });
  }
  }

  @SubscribeMessage('sendMessage')
  @UseGuards(WsAuthorizationGuard, InstructorWsGuard, StudentEnrollmentWsGuard, IsChatMemberWsGuard)
  @SetMetadata(ROLES_KEY, [Role.Student, Role.Instructor])
  async handleMessage( 
    @MessageBody() data: { room:string, addMessageDto:AddMessageDto },
    @ConnectedSocket() client: AuthenticatedSocket
  ) { 
    try {
      // Create and add the new message to the chat
      const newMessage = await this.chatService.addMessageToChatOrFail(data.addMessageDto);

      // Get the sender's name
      const sender = await this.userService.findUserById(data.addMessageDto.sender_id.toString());
      const senderName = sender ? sender.name : 'Unknown';
      this.server.to(data.room).emit('receiveMessage', {
        sender: senderName,
        content: newMessage.get('content'),
        timestamp: newMessage.get('createdAt'),
      });

      // Notify all chat members of the new message
      await this.notificationsService.createNotification(
        data.addMessageDto.sender_id.toString(),
        `New message from ${senderName}`,
        NotificationType.MESSAGE,
        data.addMessageDto.chat_id,
      );

      // this.server.to(data.room).emit('messageNotification', {
      //   title: 'New Message',
      //   body: `New message from ${senderName}`,
      // });

    } catch (error) {
      console.error('Error sending message:', error);
      client.to(data.room).emit('error', { message: 'Error sending message' });
    }
  }  

  @SubscribeMessage('joinChat')
  @UseGuards(WsAuthorizationGuard, InstructorWsGuard, StudentEnrollmentWsGuard)
  @SetMetadata(ROLES_KEY, [Role.Student, Role.Instructor])
  async handleJoinChat(
    @MessageBody() data :{ room:string, addParticipantDto:AddParticipantDto} , 
    @ConnectedSocket() client: AuthenticatedSocket) {
    const room = data.room;
    client.join(room);
    try{
    const initiatorId = client.user;
    await this.chatService.addParticipantToChatOrFail(data.addParticipantDto, initiatorId);
    const user = await this.userService.findUserById(data.addParticipantDto.participant.toString());
    const username = user ? user.name : 'Unknown';

    this.server.to(room).emit('receiveMessage', {
      message: `${username} has joined the chat`,
      sender: 'ChatBot',
      timestamp: new Date(),
    });
  }
  catch(error){
    console.error('Error joining chat:', error);
    client.to(data.room).emit('error', { message: 'Error joining chat' });  
  }
  
  }

  @SubscribeMessage('leaveChat')
  @UseGuards(WsAuthorizationGuard, IsChatMemberWsGuard)
  @SetMetadata(ROLES_KEY, [Role.Student, Role.Instructor])
  async handleLeaveChat(
    @MessageBody() data: { room : string, leaveChatDto:LeaveChatDto}, 
    @ConnectedSocket() client: AuthenticatedSocket) {
    const room = data.room;
    client.leave(room);
    try{

    await this.chatService.leaveChatOrFail(data.leaveChatDto.chat_id, data.leaveChatDto.participant);
    const user = await this.userService.findUserById(data.leaveChatDto.participant.toString());
    const username = user?.name || 'Unknown';

    this.server.to(room).emit('receiveMessage', {
      message: `${username} has left the chat`,
      sender: 'ChatBot',
      timestamp: new Date(),
    });
  }
  catch(error){
    console.error('Error leaving chat:', error);
    client.to(data.room).emit('error', { message: 'Error leaving chat' });  
  }
  }

  @SubscribeMessage('loadMessages')
  @UseGuards(WsAuthorizationGuard, IsChatMemberWsGuard)
  @SetMetadata(ROLES_KEY, [Role.Student, Role.Instructor])
  async handleLoadMessages(
    @MessageBody() data: {chatId: string},
    @ConnectedSocket() client: AuthenticatedSocket,
  ) 
  {
    const initiatorId = client.user;
    const messages = await this.chatService.getMessagesByChatId(new Types.ObjectId(data.chatId), initiatorId);
    client.emit('messageHistory', messages);
  }

}