import { Injectable,  NotFoundException, BadRequestException, ExecutionContext } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Chat, ChatDocument } from '../../Models/chat.schema';
import { Message, MessageDocument } from '../../Models/message.schema';
import { User, UserDocument } from '../../Models/user.schema';
import { EntityDoesNotExistException } from '../../common/exceptions/EntityDoesNotExist.exception';
import { Role } from '../../enums/role.enum';
import { IncorrectRoleException } from '../../common/exceptions/IncorrectRole.exception';
import { UserService } from '../../users/users.service';
import mongoose from 'mongoose';
import { ChatType } from 'src/enums/chat-type.enum';
import { CoursesService } from 'src/courses/courses.service';
import { CreateDirectChatDto } from './dto/create-direct-chat.dto';
import { CreateGroupChatDto } from './dto/create-group-chat.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Chat.name) private readonly chatModel: Model<Chat>,
    @InjectModel(Message.name) private readonly messageModel: Model<Message>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly userService: UserService,
    private readonly coursesService: CoursesService,
  ){}



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
  async createDirectChatOrFail(createDirectChatDto:CreateDirectChatDto , initiator: Types.ObjectId): Promise<Chat> {
    
    const user = await this.userService.findUserById(initiator.toString());
    const { receiverId, chatName, courseId } = createDirectChatDto;
    const receiverUser = await this.userService.findUserById(receiverId.toString());
   
    if (!receiverUser) {
      throw new EntityDoesNotExistException('User', receiverId.toString());
    }

    if( receiverUser.role == Role.Instructor || receiverUser.role == Role.Admin){
      throw new BadRequestException('student cannot chat with instructor or admin');
    }

    const course = await this.coursesService.findOne(courseId);
    if (!course) {
      throw new EntityDoesNotExistException('Course', courseId.toString());
    }

    if(user.role == Role.Instructor 
      && course.instructor_id.toString() !== initiator.toString()){
        throw new BadRequestException('Instructor is not the instructor of this course');
    }

    if(user.role == Role.Student
      && !course.students.some((student) => student._id.toString() === initiator.toString())){
        throw new BadRequestException('Student is not enrolled in this course');
    }

    if(!course.students.some((student) => student._id.toString() === receiverId.toString())){
        throw new BadRequestException('Student is not enrolled in this course');
    }
    
    const newChat = new this.chatModel({ participants: [initiator, receiverId], chat_name: chatName, chat_type: ChatType.Direct, course_id: courseId });  
    const savedChat =  await newChat.save();
    return savedChat;
  }

  async createGroupChatOrFail(createGroupChatDto:CreateGroupChatDto, initiator:  Types.ObjectId): Promise<Chat> {

    const user = await this.userService.findUserById(initiator.toString());
    const { chatName, courseId, participants } = createGroupChatDto;
    const course = await this.coursesService.findOne(courseId);
    if (!course) {
      throw new EntityDoesNotExistException('Course', courseId.toString());
    }

    if(user.role == Role.Instructor 
      && course.instructor_id.toString() !== initiator.toString()){
        throw new BadRequestException('Instructor is not the instructor of this course');
    }

    if(user.role == Role.Student
      && !course.students.some((student) => student._id.toString() === initiator.toString())){
        throw new BadRequestException('Student is not enrolled in this course');
    }
    const validParticipants = []
    for(const participant in participants){
      if(course.students.some((student) => student._id.toString() === participant.toString())
      || (course.instructor_id.toString() === participant.toString()
          && user.role != Role.Student)){
        validParticipants.push(participant)
      }
    }

    const newChat = new this.chatModel({ validParticipants, chat_name: chatName, chat_type: ChatType.Group, course_id: courseId });
    const savedChat = await newChat.save();
    return savedChat;
  }

  //7. Add participants to a chat
  async addParticipantToChatOrFail(chatId: Types.ObjectId, participant: Types.ObjectId, initiator:  Types.ObjectId): Promise<Chat> {
    console.log('Adding participants to chat:', chatId, participant);
    const chat = await this.chatModel.findOne({ _id: chatId }).exec();

    if (!chat) {
      throw new EntityDoesNotExistException('Chat', chatId.toString());
    }    

    console.log('Chat found:', chat);

    if(chat.chat_type == ChatType.Direct){
      throw new BadRequestException('Cannot add participants to a direct chat');
    }

    const validParticipant = await this.userModel.find({
      _id: participant }).exec();
    
    if (!validParticipant) {
      throw new EntityDoesNotExistException('Participant', participant.toString());
    }

    if (chat.participants.includes(participant)) {
      throw new BadRequestException('Participant already in chat');
    }

    const course = await this.coursesService.findOne(chat.course_id);
    const addedUser = await this.userService.findUserById(participant.toString());

    const userInChat = await this.userService.findUserById(initiator.toString());
    if(userInChat.role == Role.Student 
      && !course.students.some((student) => student._id.toString() === participant.toString())
    ){
      throw new IncorrectRoleException('Student not allowed to add participants');
    }
    
    if(userInChat.role == Role.Instructor
      && course.instructor_id.toString() !== participant.toString()){
      throw new IncorrectRoleException('Instructor not allowed to add participants');
    }

    if(addedUser.role==Role.Student && 
      (!course.students.some((student) => student._id.toString() === participant.toString()))){
      throw new BadRequestException('Participant is not enrolled in this course or instructor is not allowed to do this'); 
    }

    if(addedUser.role==Role.Instructor &&
      (course.instructor_id.toString() !== participant.toString())){
      throw new BadRequestException('Participant is not the instructor of this course');
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
  async updateChatNameOrFail(chatId: Types.ObjectId, chatName: string, initiator: Types.ObjectId): Promise<Chat> {
    const chat = await this.chatModel.findOne({ _id: chatId }).exec();
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }    
    
    const participantExists = chat.participants.some(participant =>
      participant.equals(initiator)
    );

    if (!participantExists) {
      throw new BadRequestException('Sender is not a participant in this chat');
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

  async getMessagesByChatId(chatId: Types.ObjectId, initiator:  Types.ObjectId): Promise<Message[]>{
    const chat = await this.chatModel.findOne({ _id: chatId }).populate('messages').exec();

    if (!chat) {
      throw new EntityDoesNotExistException('Chat', chatId.toString());
    }

    const participantExists = chat.participants.some(participant =>
      participant.equals(initiator)
    );

    if (!participantExists) {
      throw new BadRequestException('Sender is not a participant in this chat');
    }
  
    // Extract the populated messages
    const messages = await this.messageModel.find({ _id: { $in: chat.messages } }).exec();
  
    return messages;
  }
  
}
