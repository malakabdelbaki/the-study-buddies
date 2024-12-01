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
import { ROLES_KEY } from 'src/auth/decorators/roles.decorator';
@UseGuards(WsJwtGuard)

@WebSocketGateway({
  cors:{
  origin: '*',
  methods: ['GET', 'POST'],
}})

export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(private readonly chatService: ChatService,
              private readonly userService : UserService,
              private readonly coursesService: CoursesService) {}

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
  @UseGuards(WsAuthorizationGuard)
  @SetMetadata(ROLES_KEY, [Role.Admin, Role.Instructor])
  async handleCreateGroupChat(
    @MessageBody() data: { room : string, chatName: string, courseId: string, receiverId:string}, 
    @ConnectedSocket() client: AuthenticatedSocket
  ) : Promise<WsResponse<any>>{

    console.log('Received data:', data);  
  
    try{
      const userId = client.user; 
      const user = await this.userService.findUserById(userId.toString());

      const dto = new CreateDirectChatDto();
      dto.chatName = data.chatName;
      dto.receiverId =  new Types.ObjectId(data.receiverId);
      dto.courseId = new Types.ObjectId(data.courseId);;

      const newChat = await this.chatService.createGroupChatOrFail(dto, userId);
      const course = await this.coursesService.findOne(new Types.ObjectId(data.courseId)); 
      this.server.to(data.room).emit('chatCreated', {
        chat_id: (newChat as any)._id,
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
  @UseGuards(WsAuthorizationGuard)
  @SetMetadata(ROLES_KEY, [Role.Admin, Role.Instructor])
  async handleCreateDirectChat(
  @MessageBody() data: { room : string, chatName: string, receiverId: string, courseId: string}, 
  @ConnectedSocket() client: AuthenticatedSocket) : Promise<WsResponse<any>>{
    console.log('Received data:', data);  // Log the incoming data
    
    try{
      
    const userId = client.user;
    const user = await this.userService.findUserById(userId.toString());
    const receiverObjectId = new Types.ObjectId(data.receiverId);
    const courseObjectId = new Types.ObjectId(data.courseId);
    const dto = new CreateDirectChatDto();
    dto.chatName = data.chatName;
    dto.receiverId = receiverObjectId;
    dto.courseId = courseObjectId;

    const newChat = await this.chatService.createDirectChatOrFail(dto, userId);

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
  @UseGuards(WsAuthorizationGuard)
  @SetMetadata(ROLES_KEY, [Role.Admin, Role.Instructor])
  async handleMessage( 
    @MessageBody() data: { room:string, chatId: string, senderId: string, content: string },
    @ConnectedSocket() client: AuthenticatedSocket
  ) {
    const { room, chatId, senderId, content } = data;
    const chatObjectId = new Types.ObjectId(chatId);
    const senderObjectId = new Types.ObjectId(senderId);
    
    try {
      // Create and add the new message to the chat
      const newMessage = await this.chatService.addMessageToChatOrFail(
        chatObjectId,
        senderObjectId,
        content,
      );

      // Get the sender's name
      const sender = await this.userService.findUserById(senderId);
      const senderName = sender ? sender.name : 'Unknown';
      this.server.to(data.room).emit('receiveMessage', {
        sender: senderName,
        content: newMessage.get('content'),
        timestamp: newMessage.get('createdAt'),
      });

      this.server.to(room).emit('messageNotification', {
        title: 'New Message',
        body: `New message from ${senderName}`,
      });

    } catch (error) {
      console.error('Error sending message:', error);
      client.to(data.room).emit('error', { message: 'Error sending message' });
    }
  }  

  @SubscribeMessage('joinChat')
  @UseGuards(WsAuthorizationGuard)
  @SetMetadata(ROLES_KEY, [Role.Admin, Role.Instructor])
  async handleJoinChat(
    @MessageBody() data :{ room:string, chatId: string, senderId: string} , 
    @ConnectedSocket() client: AuthenticatedSocket) {
    const { room, chatId, senderId } = data;
    client.join(room);

    console.log(`User ${senderId} joined chat ${room}`);
    const chatObjectId = new Types.ObjectId(chatId);
    const studentObjectId = new Types.ObjectId(senderId);
    
    try{
    const initiatorId = client.user;
    await this.chatService.addParticipantToChatOrFail(chatObjectId, studentObjectId, initiatorId);
    const user = await this.userService.findUserById(senderId);
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
  @UseGuards(WsAuthorizationGuard)
  @SetMetadata(ROLES_KEY, [Role.Admin, Role.Instructor])
  async handleLeaveChat(
    @MessageBody() data: { room:string, chatId: string, senderId: string} , 
    @ConnectedSocket() client: AuthenticatedSocket) {
    const {room, chatId, senderId } = data
    client.leave(room);

    console.log(`Client ${senderId} left chat ${room}`);

    const chatObjectId = new Types.ObjectId(chatId);
    const studentObjectId = new Types.ObjectId(senderId);
    try{
    await this.chatService.leaveChatOrFail(chatObjectId, studentObjectId);
    const user = await this.userService.findUserById(senderId);
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
  @UseGuards(WsAuthorizationGuard)
  @SetMetadata(ROLES_KEY, [Role.Admin, Role.Instructor])
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