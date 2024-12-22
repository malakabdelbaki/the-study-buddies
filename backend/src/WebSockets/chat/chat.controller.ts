import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req, UseGuards, SetMetadata } from '@nestjs/common';
import { ChatService } from './chat.service';
import { SearchChatsDto } from './dto/searchChat.dto';
import { AddParticipantDto } from './dto/AddParticipant.dto';
import { AddMessageDto } from './dto/AddMessage.dto';
import { UpdateChatNameDto } from './dto/UpdateChatName.dto';
import { Types } from 'mongoose';
import { ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { CreateGroupChatDto } from './dto/create-group-chat.dto';
import { CreateDirectChatDto } from './dto/create-direct-chat.dto';
import { Chat } from 'src/Models/chat.schema';
import { AuthGuard } from 'src/auth/guards/authentication.guard';
import { authorizationGuard } from 'src/auth/guards/authorization.guard';
import { ROLES_KEY } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { IsChatMemberHttpGuard } from 'src/auth/guards/IsChatMember.guard';
import { PusherService } from 'src/pusher/pusher.service';

@UseGuards(AuthGuard, authorizationGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService,
    private readonly pusherService: PusherService
  ) {}
// 1. Get all chats in which the student is a participant
@Get()
@ApiOperation({ summary: 'Get all chats for a student' })
@ApiResponse({ status: 200, description: 'List of chats for the student' })
@SetMetadata( ROLES_KEY, [Role.Instructor, Role.Student])
async getChatsOfUser(@Req() req: any) {
  console.log(req);
  console.log(req.user);
  return await this.chatService.getChatsOfAStudentOrFail(req.user.userid);
}

  // @Get(':chat_id/newMessages')
  // @SetMetadata( ROLES_KEY, [Role.Instructor, Role.Student])
  // async getMessages(
  //   @Param('chat_id') chat_id: string,
  //   @Query('timestamp') timestamp: string,
  // ) {
  //   if (!chat_id) {
  //     throw new Error('Room ID is required');
  //   }
  //   console.log('chat_id', chat_id);
  //   console.log('timestamp', timestamp);
  //   const messages = await this.chatService.getNewMessages(chat_id, timestamp);
  //   return messages;
  // }

  @Get(':chat_id/newMessages')
@SetMetadata(ROLES_KEY, [Role.Instructor, Role.Student])
async getMessages(
  @Param('chat_id') chat_id: string,
  @Query('lastMessageId') lastMessageId?: string, // Updated query parameter
) {
  if (!chat_id) {
    throw new Error('Room ID is required');
  }
  console.log('chat_id:', chat_id);
  console.log('lastMessageId:', lastMessageId);

  const messages = await this.chatService.getNewMessages(chat_id, lastMessageId);
  return messages;
}


  @Get('publicGroups')
  @ApiOperation({ summary: 'Get all public group chats' })
  @ApiResponse({ status: 200, description: 'List of all public group chats' })
  @SetMetadata(ROLES_KEY, [Role.Instructor, Role.Student])
  async getPublicGroupChats(@Req() req: any) {
      console.log('req.user.userid', req.user.userid);
      return await this.chatService.getPublicGroupChats(req.user.userid);
    }
    
  @Get('/history/:chat_id')
  @ApiOperation({ summary: 'Get all chats with messages' })
  @ApiResponse({ status: 200, description: 'List of all chats' })
  @ApiParam({ name: 'chat_id', type: String, description: 'The ID of the chat' })
  @SetMetadata( ROLES_KEY, [Role.Instructor, Role.Student])
  @UseGuards(IsChatMemberHttpGuard)
  async getAllChatHistory(
    @Param('chat_id') chat_id: Types.ObjectId,
    @Req() req: any,
    @Query('timestamp') timestamp?: string,
  ) {
    return await this.chatService.getMessagesByChatId(chat_id, req.user.userid, timestamp);
  }


  // 2. Get a certain chat by ID
  @Get(':chat_id')
  @ApiOperation({ summary: 'Get a specific chat for a student by ID' })
  @ApiResponse({ status: 200, description: 'The requested chat' })
  @ApiParam({ name: 'studentId', type: String, description: 'The ID of the student' })
  @ApiParam({ name: 'chat_id', type: String, description: 'The ID of the chat' })
  @SetMetadata( ROLES_KEY, [Role.Instructor, Role.Student])
  @UseGuards(IsChatMemberHttpGuard)
  async getChatOfStudentById(@Param('chat_id') chat_id: string) {
    return await this.chatService.getChatByIdOrFail(new Types.ObjectId(chat_id));
  }


  // 6. Create a new chat with other students with the student as a participant and choose chat name
  @Post('group')
  @ApiOperation({ summary: 'Create a new chat with other students' })
  @ApiResponse({ status: 201, description: 'Chat successfully created' })
  @ApiBody({ type: CreateGroupChatDto, description: 'Details for creating the chat' })
  @SetMetadata( ROLES_KEY, [Role.Instructor, Role.Student])
  async createGroupChat(
    @Body() createGroupChatDto: CreateGroupChatDto,
    @Req() req: any) : Promise<Chat> {
    return this.chatService.createGroupChatOrFail(createGroupChatDto,  req.user.userid);
  }

  @Post('direct')
  @ApiOperation({ summary: 'Create a new chat with other students' })
  @ApiResponse({ status: 201, description: 'Chat successfully created' })
  @ApiBody({ type: CreateDirectChatDto, description: 'Details for creating the chat' })
  @SetMetadata( ROLES_KEY, [Role.Instructor, Role.Student])

  async createDirectChat(
    @Body() createDirectChatDto: CreateDirectChatDto,
    @Req() req: any) : Promise<Chat> {
      return await this.chatService.createDirectChatOrFail(createDirectChatDto,  req.user.userid);
  }


  // 7. Update a chat to include new participants 
  @Patch('add-participant/:chat_id')
  @ApiOperation({ summary: 'Add new participants to a chat' })
  @ApiResponse({ status: 200, description: 'Chat updated with new participants' })
  @ApiParam({ name: 'chat_id', type: String, description: 'The ID of the chat to update' })
  @ApiBody({ type: AddParticipantDto, description: 'Participants to add to the chat' })
  @SetMetadata( ROLES_KEY, [Role.Instructor, Role.Student])
  @UseGuards(IsChatMemberHttpGuard)
  async addParticipant(
    @Param('chat_id') chat_id: string,
    @Body() addParticipantDto: AddParticipantDto,
    @Req() req: any) {
      console.log("im cont");
    return await this.chatService.addParticipantToChatOrFail(new Types.ObjectId(chat_id), addParticipantDto, req.user.userid);
  }

  // 8. Update a chat to include new messages
  @Patch('add-message/:chat_id')
  @ApiOperation({ summary: 'Add a new message to a chat' })
  @ApiResponse({ status: 200, description: 'Message added to the chat' })
  @ApiParam({ name: 'chat_id', type: String, description: 'The ID of the chat to update' })
  @ApiBody({ type: AddMessageDto, description: 'Message details to add to the chat' })
  @SetMetadata( ROLES_KEY, [Role.Instructor, Role.Student])
  @UseGuards(IsChatMemberHttpGuard)

  async addMessage(
    @Param('chat_id') chat_id: string, 
    @Body() addMessageDto: AddMessageDto,
    @Req() req: any) {

      const message = await this.chatService.addMessageToChatOrFail(new Types.ObjectId(chat_id), addMessageDto, new Types.ObjectId(req.user.userid));
      await this.pusherService.trigger(`chat-${chat_id}`, 'new-message', message);
    return message;
  }

  // 9. Update chat name of a chat
  @ApiOperation({ summary: 'Update the chat name' })
  @ApiResponse({ status: 200, description: 'Chat type updated' })
  @ApiParam({ name: 'chat_id', type: String, description: 'The ID of the chat to update' })
  @ApiBody({ type: UpdateChatNameDto, description: 'New chat type to set' })
  @Patch('update-name/:chat_id')
  @SetMetadata( ROLES_KEY, [Role.Instructor, Role.Student])
  @UseGuards(IsChatMemberHttpGuard)

  async updateChatName(
    @Param('chat_id') chat_id: Types.ObjectId, @Body() updateChatNameDto: UpdateChatNameDto,
    @Req() req: any) {
    const initiator = req.user.userid;
    return await this.chatService.updateChatNameOrFail(chat_id, updateChatNameDto.chatName, initiator); 
  }

  // 10. Leave a chat (remove student ID from participants list and if a chat has no participants it is archived)
  @Patch('leave/:chat_id')
  @ApiOperation({ summary: 'Remove a student from a chat (leave chat)' })
  @ApiResponse({ status: 200, description: 'Student removed from the chat' })
  @ApiParam({ name: 'chat_id', type: String, description: 'The ID of the chat to leave' })
  @ApiParam({ name: 'studentId', type: String, description: 'The ID of the student leaving the chat' })
  @SetMetadata( ROLES_KEY, [Role.Instructor, Role.Student])
  @UseGuards(IsChatMemberHttpGuard)

  async leaveChat(
    @Param('chat_id') chat_id: Types.ObjectId,
    @Req() req: any) {
    return this.chatService.leaveChatOrFail(chat_id, new Types.ObjectId(req.user.userid));
  }

 
  
  
  //axios.get('/api/users')
  @Get('potential-participants/:course_id')
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of all users' })
  @SetMetadata( ROLES_KEY, [Role.Instructor, Role.Student])
  async getAllPotentialParticipants(
     @Req() req: any,
    @Param('course_id') course_id: string) {
    return await this.chatService.getPotentialParticipants(course_id, req.user.userid);
  }

}


/*
In the ChatController I want the student to be able to:
1. get all chats in which he was a participant
2. get a certain chat by ID in which he was a participant
3. get chats in which he was a participant by chatname
4. get chats in which he was a participant by message content
5. get chats in which he was a participant by searching for certain participants
6. create a new chat with other 1 or many students with him and them as participants and choose chatname
7. update a chat to include new participants and accordingly change chat type
8. update a chat to include new messages
9. update chatname (public or private) of a chat
10. leave a chat (remove his id from participants list and if a chat has no participants it is archived)
*/