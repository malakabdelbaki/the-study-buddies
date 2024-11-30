import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { SearchChatsDto } from './dto/searchChat.dto';
import { CreateChatDto } from './dto/createChat.dto';
import { AddParticipantDto } from './dto/AddParticipant.dto';
import { AddMessageDto } from './dto/AddMessage.dto';
import { UpdateChatNameDto } from './dto/updateChatName.dto';
import { Types } from 'mongoose';
import { ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  //getAllChats with 
  @Get()
  @ApiOperation({ summary: 'Get all chats with participants' })
  @ApiResponse({ status: 200, description: 'List of all chats' })
  async getAllChats() {
    return await this.chatService.getAllChats();
  }

  @Get('/history:chatId')
  @ApiOperation({ summary: 'Get all chats with messages' })
  @ApiResponse({ status: 200, description: 'List of all chats' })
  @ApiParam({ name: 'chatId', type: String, description: 'The ID of the chat' })

  async getAllChatHistory(@Param('chatId') chatId: string) {
    const chatObjectId = new Types.ObjectId(chatId)
    return await this.chatService.getMessagesByChatId(chatObjectId);
  }

  // 1. Get all chats in which the student is a participant
  @Get(':studentId')
  @ApiOperation({ summary: 'Get all chats for a student' })
  @ApiResponse({ status: 200, description: 'List of chats for the student' })
  @ApiParam({ name: 'studentId', type: String, description: 'The ID of the student' })

  async getChatsOfStudent(@Param('studentId') studentId: string) {
    const studentObjectId = new Types.ObjectId(studentId);
    return await this.chatService.getChatsOfAStudentOrFail(studentObjectId);

  }

  // 2. Get a certain chat by ID
  @Get(':chatId')
  @ApiOperation({ summary: 'Get a specific chat for a student by ID' })
  @ApiResponse({ status: 200, description: 'The requested chat' })
  @ApiParam({ name: 'studentId', type: String, description: 'The ID of the student' })
  @ApiParam({ name: 'chatId', type: String, description: 'The ID of the chat' })
  
  async getChatOfStudentById(@Param('chatId') chatId: string) {
    const chatObjectId = new Types.ObjectId(chatId);
    return await this.chatService.getChatByIdOrFail(chatObjectId);
  }

  // 3. Get chats in which the student is a participant by chat type
  // 4. Get chats in which the student is a participant by message content
  // 5. Get chats in which the student is a participant by searching for certain participants


  @Get('search/:studentId')
  @ApiOperation({ summary: 'Search chats for a student by criteria' })
  @ApiResponse({ status: 200, description: 'List of chats matching the search criteria' })
  @ApiQuery({ name: 'participants', type: [String], description: 'List of participants to search for' })
  @ApiQuery({ name: 'query', type: String, description: 'Search query for message content or participants' })

  async searchChats( @Query() searchChatsDto: SearchChatsDto) {
    const chatName = searchChatsDto.chatName;
    const participants = searchChatsDto.participants;
    const content = searchChatsDto.query;
    return await this.chatService.searchChats(participants, chatName, content);
  }

  // 6. Create a new chat with other students with the student as a participant and choose chat name
  @Post()
  @ApiOperation({ summary: 'Create a new chat with other students' })
  @ApiResponse({ status: 201, description: 'Chat successfully created' })
  @ApiBody({ type: CreateChatDto, description: 'Details for creating the chat' })

  async createChat(@Body() createChatDto: CreateChatDto) {
    return this.chatService.createChat(createChatDto.participants, createChatDto.chatName);
  }

  // 7. Update a chat to include new participants 
  @Patch('add-participant/:chatId')
  @ApiOperation({ summary: 'Add new participants to a chat' })
  @ApiResponse({ status: 200, description: 'Chat updated with new participants' })
  @ApiParam({ name: 'chatId', type: String, description: 'The ID of the chat to update' })
  @ApiBody({ type: AddParticipantDto, description: 'Participants to add to the chat' })

  async addParticipant(@Param('chatId') chatId: string,@Body() addParticipantDto: AddParticipantDto) {
    const chatObjectId = new Types.ObjectId(chatId);
    return await this.chatService.addParticipantToChatOrFail(chatObjectId, addParticipantDto.participant);
  }

  // 8. Update a chat to include new messages
  @Patch('add-message/:chatId')
  @ApiOperation({ summary: 'Add a new message to a chat' })
  @ApiResponse({ status: 200, description: 'Message added to the chat' })
  @ApiParam({ name: 'chatId', type: String, description: 'The ID of the chat to update' })
  @ApiBody({ type: AddMessageDto, description: 'Message details to add to the chat' })

  async addMessage(@Param('chatId') chatId: string, @Body() addMessageDto: AddMessageDto) {
    const chatObjectId = new Types.ObjectId(chatId);
    const senderObjectId = new Types.ObjectId(addMessageDto.sender_id);
    return await this.chatService.addMessageToChatOrFail(chatObjectId, senderObjectId, addMessageDto.content);
  }

  // 9. Update chat name (public or private) of a chat
  @ApiOperation({ summary: 'Update the chat name' })
  @ApiResponse({ status: 200, description: 'Chat type updated' })
  @ApiParam({ name: 'chatId', type: String, description: 'The ID of the chat to update' })
  @ApiBody({ type: UpdateChatNameDto, description: 'New chat type to set' })
  @Patch('update-type/:chatId')

  async updateChatName(@Param('chatId') chatId: string, @Body() updateChatNameDto: UpdateChatNameDto) {
    const chatObjectId = new Types.ObjectId(chatId);
    return await this.chatService.updateChatNameOrFail(chatObjectId, updateChatNameDto.chatName);
  }

  // 10. Leave a chat (remove student ID from participants list and if a chat has no participants it is archived)
  @Patch('leave/:chatId/:studentId')
  @ApiOperation({ summary: 'Remove a student from a chat (leave chat)' })
  @ApiResponse({ status: 200, description: 'Student removed from the chat' })
  @ApiParam({ name: 'chatId', type: String, description: 'The ID of the chat to leave' })
  @ApiParam({ name: 'studentId', type: String, description: 'The ID of the student leaving the chat' })
  async leaveChat(@Param('chatId') chatId: string, @Param('studentId') studentId: string) {
    const chatObjectId = new Types.ObjectId(chatId);
    const studentObjectId = new Types.ObjectId(studentId);
    return this.chatService.leaveChatOrFail(chatObjectId, studentObjectId);
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