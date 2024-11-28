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
    //to do: jwt authentication
    console.log('client connected ', client.id);
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
    const { chatId, senderId, content } = data;
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
      this.server.to(data.room).emit('newMessage', {
        sender: senderName,
        content: newMessage.get('content'),
        timestamp: newMessage.get('createdAt'),
      });
    } catch (error) {
      console.error('Error sending message:', error);
      client.to(data.room).emit('error', { message: 'Error sending message' });
    }
  }  

  @SubscribeMessage('joinChat')
  async handleJoinChat(@MessageBody() data :{ room:string, chatId: string, senderId: string} , @ConnectedSocket() client: Socket) {
    const { chatId, senderId } = data;
    client.join(chatId);
    console.log(`Client ${client.id} joined chat ${chatId}`);
    const chatObjectId = new Types.ObjectId(chatId);
    const studentObjectId = new Types.ObjectId(senderId);
    
    try {
      console.log('Joining chat:', chatObjectId, studentObjectId);
      await this.chatService.addParticipantToChatOrFail(chatObjectId, studentObjectId);
      const student = await this.userService.findUserById(senderId);
      this.server.to(data.room).emit('A new student joined', {
        studentName: student.name,
      });
    } catch (error) {
      console.error('Error joining chat:', error);
      client.to(data.room).emit('error', { message: 'Error joining chat' });
    }
  
  }

  @SubscribeMessage('leaveChat')
  async handleLeaveChat(@MessageBody() data: { room:string, chatId: string, senderId: string} , @ConnectedSocket() client: Socket) {
    const { chatId, senderId } = data
    client.leave(chatId);
    console.log(`Client ${client.id} left chat ${chatId}`);
    const chatObjectId = new Types.ObjectId(chatId);
    const studentObjectId = new Types.ObjectId(senderId);
    try {
      await this.chatService.leaveChatOrFail(chatObjectId, studentObjectId);
      const student = await this.userService.findUserById(senderId);
      this.server.to(data.room).emit('A student left', {
        studentName: student.name,
      });
    } catch (error) {
      console.error('Error leaving chat:', error);
      client.to(data.room).emit('error', { message: 'Error leaving chat' });
    }
  }

  @SubscribeMessage('loadMessages')
  async handleLoadMessages(
    @MessageBody() chatId: string,
    @ConnectedSocket() client: Socket,
  ) 
  {
    const messages = await this.chatService.getMessagesByChatId(new Types.ObjectId(chatId));
    client.emit('messageHistory', messages);
  }

}