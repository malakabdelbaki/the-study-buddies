import { SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, MessageBody, ConnectedSocket, WsResponse  } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io'; 
import { ChatService } from './chat.service';
import { Types } from 'mongoose';
import { UserService } from '../users/users.service';

@WebSocketGateway({
  cors:{
  origin: '*',
  methods: ['GET', 'POST'],
}})

export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(private readonly chatService: ChatService,
              private readonly userService : UserService) {}

  handleConnection(@ConnectedSocket() client: Socket, ...args: any[]) {
    console.log('client connected ', client.id);
  //   try {
  //     const token = client.handshake.headers.authorization?.split(' ')[1]; // Extract Bearer token
  //     if (!token) {
  //         throw new UnauthorizedException('No token provided');
  //     }

  //     const payload = this.jwtService.verify(token); // Verify token
  //     client.data.user = payload; // Attach user info to the client object
  //     console.log(`Client connected: ${client.id}, User: ${payload.id}`);
  // } catch (error) {
  //     console.error('Authentication error:', error.message);
  //     client.disconnect(); // Disconnect unauthorized clients
  // }
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    console.log('client disconnected ', client.id);
  }

  @SubscribeMessage('createChat')
  async handleCreateChat(@MessageBody() data: { room : string, chatName: string, participants: string[]}, @ConnectedSocket() client: Socket) : Promise<WsResponse<any>>{
    console.log('Received data:', data);  // Log the incoming data
    
    const studentObjectIds = data.participants.map((id) => new Types.ObjectId(id));
    const newChatId = await this.chatService.createChat(studentObjectIds, data.chatName);
    const newChat = await this.chatService.getChatByIdOrFail(newChatId);

    for (const studentId of studentObjectIds) {
      const student = await this.userService.findUserById(studentId.toString());
      this.server.to(data.room).emit('chatCreated', {
        chat_id: newChatId,
        chatName: newChat.chat_name,
        studentName: student.name, // Send student name
      });
    }
    return { event: 'chatCreated', data: newChat };
  }

  @SubscribeMessage('sendMessage')
  async handleMessage( 
    @MessageBody() data: { room:string, chatId: string, senderId: string, content: string },
    @ConnectedSocket() client: Socket
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
  async handleJoinChat(@MessageBody() data :{ room:string, chatId: string, senderId: string} , @ConnectedSocket() client: Socket) {
    const { room, chatId, senderId } = data;
    client.join(room);

    console.log(`User ${senderId} joined chat ${room}`);
    const chatObjectId = new Types.ObjectId(chatId);
    const studentObjectId = new Types.ObjectId(senderId);
    
    try{
    await this.chatService.addParticipantToChatOrFail(chatObjectId, studentObjectId);
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
  async handleLeaveChat(@MessageBody() data: { room:string, chatId: string, senderId: string} , @ConnectedSocket() client: Socket) {
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
  async handleLoadMessages(
    @MessageBody() data: {chatId: string},
    @ConnectedSocket() client: Socket,
  ) 
  {
    const messages = await this.chatService.getMessagesByChatId(new Types.ObjectId(chatId));
    client.emit('messageHistory', messages);
  }

}