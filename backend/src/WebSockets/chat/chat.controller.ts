import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req, UseGuards, SetMetadata } from '@nestjs/common';
import { ChatService } from './chat.service';
import { SearchChatsDto } from './dto/searchChat.dto';
import { AddParticipantDto } from './dto/AddParticipant.dto';
import { AddMessageDto } from './dto/AddMessage.dto';
import { UpdateChatNameDto } from './dto/updateChatName.dto';
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


@UseGuards(AuthGuard, authorizationGuard, IsChatMemberHttpGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService,
  ) {}


  @Get('/history:chatId')
  @ApiOperation({ summary: 'Get all chats with messages' })
  @ApiResponse({ status: 200, description: 'List of all chats' })
  @ApiParam({ name: 'chat_id', type: String, description: 'The ID of the chat' })
  @SetMetadata( ROLES_KEY, [Role.Instructor, Role.Student])
  async getAllChatHistory(
    @Param('chat_id') chat_id: Types.ObjectId,
    @Req() req: any) {
    return await this.chatService.getMessagesByChatId(chat_id, req.user.userid);
  }

  // 1. Get all chats in which the student is a participant
  @Get()
  @ApiOperation({ summary: 'Get all chats for a student' })
  @ApiResponse({ status: 200, description: 'List of chats for the student' })
  @SetMetadata( ROLES_KEY, [Role.Instructor, Role.Student])
  async getChatsOfUser(@Req() req: any) {
    return await this.chatService.getChatsOfAStudentOrFail( req.user.userid);

  }

  // 2. Get a certain chat by ID
  @Get(':chatId')
  @ApiOperation({ summary: 'Get a specific chat for a student by ID' })
  @ApiResponse({ status: 200, description: 'The requested chat' })
  @ApiParam({ name: 'studentId', type: String, description: 'The ID of the student' })
  @ApiParam({ name: 'chatId', type: String, description: 'The ID of the chat' })
  @SetMetadata( ROLES_KEY, [Role.Instructor, Role.Student])
  async getChatOfStudentById(@Param('chat_id') chat_id: Types.ObjectId) {
    return await this.chatService.getChatByIdOrFail(chat_id);
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
  @Patch('add-participant/:chatId')
  @ApiOperation({ summary: 'Add new participants to a chat' })
  @ApiResponse({ status: 200, description: 'Chat updated with new participants' })
  @ApiParam({ name: 'chatId', type: String, description: 'The ID of the chat to update' })
  @ApiBody({ type: AddParticipantDto, description: 'Participants to add to the chat' })
  @SetMetadata( ROLES_KEY, [Role.Instructor, Role.Student])

  async addParticipant(
    @Param('chatId') chatId: string,
    @Body() addParticipantDto: AddParticipantDto,
    @Req() req: any) {
    return await this.chatService.addParticipantToChatOrFail(addParticipantDto, req.user.userid);
  }

  // 8. Update a chat to include new messages
  @Patch('add-message/:chatId')
  @ApiOperation({ summary: 'Add a new message to a chat' })
  @ApiResponse({ status: 200, description: 'Message added to the chat' })
  @ApiParam({ name: 'chatId', type: String, description: 'The ID of the chat to update' })
  @ApiBody({ type: AddMessageDto, description: 'Message details to add to the chat' })
  @SetMetadata( ROLES_KEY, [Role.Instructor, Role.Student])

  async addMessage(@Param('chatId') chatId: string, @Body() addMessageDto: AddMessageDto) {
    return await this.chatService.addMessageToChatOrFail(addMessageDto);
  }

  // 9. Update chat name (public or private) of a chat
  @ApiOperation({ summary: 'Update the chat name' })
  @ApiResponse({ status: 200, description: 'Chat type updated' })
  @ApiParam({ name: 'chatId', type: String, description: 'The ID of the chat to update' })
  @ApiBody({ type: UpdateChatNameDto, description: 'New chat type to set' })
  @Patch('update-type/:chatId')
  @SetMetadata( ROLES_KEY, [Role.Instructor, Role.Student])

  async updateChatName(
    @Param('chatId') chatId: Types.ObjectId, @Body() updateChatNameDto: UpdateChatNameDto,
    @Req() req: any) {
    const initiator = req.user.userid;
    return await this.chatService.updateChatNameOrFail(chatId, updateChatNameDto.chatName, initiator); 
  }

  // 10. Leave a chat (remove student ID from participants list and if a chat has no participants it is archived)
  @Patch('leave/:chatId/:studentId')
  @ApiOperation({ summary: 'Remove a student from a chat (leave chat)' })
  @ApiResponse({ status: 200, description: 'Student removed from the chat' })
  @ApiParam({ name: 'chatId', type: String, description: 'The ID of the chat to leave' })
  @ApiParam({ name: 'studentId', type: String, description: 'The ID of the student leaving the chat' })
  @SetMetadata( ROLES_KEY, [Role.Instructor, Role.Student])

  async leaveChat(@Param('chatId') chatId: Types.ObjectId, @Param('studentId') studentId: Types.ObjectId) {
    return this.chatService.leaveChatOrFail(chatId, studentId);
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