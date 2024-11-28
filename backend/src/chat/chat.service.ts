import { Injectable,  NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Chat, ChatDocument } from '../Models/chat.schema';
import { Message, MessageDocument } from '../Models/message.schema';
import { User, UserDocument } from '../Models/user.schema';
import { EntityDoesNotExistException } from '../common/exceptions/EntityDoesNotExist.exception';
import { Role } from '../enums/role.enum';
import { IncorrectRoleException } from '../common/exceptions/IncorrectRole.exception';
import { UserService } from '../users/users.service';
import mongoose from 'mongoose';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Chat.name) private readonly chatModel: Model<Chat>,
    @InjectModel(Message.name) private readonly messageModel: Model<Message>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly userService: UserService
  ){}


  // 0. Get all chats
  async getAllChats(): Promise<Chat[]> {
    const chats = await this.chatModel.find().populate('participants').exec();
    return chats;
  }

  // 1. Get all chats of a student
  async getChatsOfAStudentOrFail(studentId: Types.ObjectId): Promise<Chat[]> {
    const chats =  await this.chatModel.find({ participants: studentId }).populate('participants').exec();
    console.log(chats);
    return chats;
  }

  // 2. Get a certain chat by ID 
  async getChatByIdOrFail(chatId: Types.ObjectId): Promise<Chat> {
    const chat = await this.chatModel.findOne({_id: chatId}).exec();
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }
    return chat;
  }


  // 3, 4, 5. Search for chats based on type, message content, or participants
  async searchChats(
    participants?: Types.ObjectId[], 
    chatName?: string, 
    query?: string
  ): Promise<Chat[]> {  
    const filter: any = {};
  
    if (participants && participants.length > 0) {
      filter.participants = { $all: participants };
    }
   
    if (chatName) {  // Add filter for chat name
      filter.name = { $regex: chatName, $options: 'i' };
    }

    if (query) {
      // Find messages that match the query
      const matchingMessages = await this.messageModel.find({ 
        content: { $regex: query, $options: 'i' } 
      }, '_id').exec();
      
      filter.messages = { $in: matchingMessages.map(m => m._id) };
    }
  
    return this.chatModel.find(filter).populate('participants').exec();
  }
  

  //6. create a new chat
  async createChat(participants: Types.ObjectId[], chatName: string): Promise<Types.ObjectId> {

    const objectIdParticipants = participants.map((id) =>
      Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : id
    );

    const newChat = new this.chatModel({ participants: objectIdParticipants, chat_name: chatName });  
    const savedChat =  await newChat.save();
    return savedChat._id;
  }

  //7. Add participants to a chat
  async addParticipantToChatOrFail(chatId: Types.ObjectId, participant: Types.ObjectId): Promise<Chat> {
    console.log('Adding participants to chat:', chatId, participant);
    const chat = await this.chatModel.findOne({ _id: chatId }).exec();
    if (!chat) {
      throw new EntityDoesNotExistException('Chat', chatId.toString());
    }    
    console.log('Chat found:', chat);

    const validParticipant = await this.userModel.find({
      _id: { $in: [participant] }}).exec();
    console.log('Valid participants:', validParticipant);
    
    if (!validParticipant) {
      throw new EntityDoesNotExistException('Participant', participant.toString());
    }


    if (chat.participants.includes(participant)) {
      throw new BadRequestException('Participant already in chat');
    }

    chat.participants.push(participant);
    console.log('Participants added:', chat.participants);
    
    const chatsaved = await (chat as ChatDocument).save();
    console.log('Chat saved:', chat);
    return chatsaved;
  }

  // 8. Add a message to a chat
  async addMessageToChatOrFail(chatId: Types.ObjectId, senderId: Types.ObjectId, content: string) {

    console.log('Adding message to chat:', chatId, senderId, content);

    const chat = await this.chatModel.findOne({ _id: chatId }).exec();
    if (!chat) {
      throw new EntityDoesNotExistException('Chat', chatId.toString());
    }
    const senderObjectId = new Types.ObjectId(senderId);

    const participantExists = chat.participants.some(participant =>
      participant.equals(senderObjectId) 
    );

    
    if (!participantExists) {
      throw new BadRequestException('Sender is not a participant in this chat');
    }

    // Create a new message
    const message = new this.messageModel({
      sender_id: senderId,
      content: content,     
    });

    // Save the new message
    const savedMessage = await message.save();
    chat.messages.push(savedMessage._id);
    await chat.save();
    return savedMessage;
  }


  // 9. Update chat type of a chat
  async updateChatNameOrFail(chatId: Types.ObjectId, chatName: string): Promise<Chat> {
    const chat = await this.chatModel.findOne({ _id: chatId }).exec();
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }    
    
    chat.chat_name = chatName;
    return (chat as ChatDocument).save();
  }

  // 10. Leave a chat
  async leaveChatOrFail(chatId: Types.ObjectId, studentId: Types.ObjectId): Promise<Chat> {
    const chat = await this.chatModel.findOne({ _id: chatId }).exec();
    if (!chat) {
      throw new EntityDoesNotExistException('Chat', chatId.toString());
    }

    if(!chat.participants.includes(studentId)){
      throw new BadRequestException('Student is not a participant in this chat');
    }

    chat.participants = chat.participants.filter(id => id.toString() !== studentId.toString());
   
    if (chat.participants.length === 0) {
      chat.isArchived = true;
    }

    return await (chat as ChatDocument).save();
  }

  async getMessagesByChatId(chatId: Types.ObjectId): Promise<Message[]>{

    // const chat = await this.chatModel.findOne({ _id: chatId }).populate("messages").exec();
    // if (!chat) {
    //   throw new EntityDoesNotExistException('Chat', chatId.toString());
    // }
    // return chat;
    const chat = await this.chatModel.findOne({ _id: chatId }).populate('messages').exec();

    if (!chat) {
      throw new EntityDoesNotExistException('Chat', chatId.toString());
    }
  
    // Extract the populated messages
    const messages = await this.messageModel.find({ _id: { $in: chat.messages } }).exec();
  
    return messages;
  }
  
}
