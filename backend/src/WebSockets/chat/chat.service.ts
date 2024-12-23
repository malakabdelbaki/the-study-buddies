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
import { AddMessageDto } from './dto/AddMessage.dto';
import { AddParticipantDto } from './dto/AddParticipant.dto';
import { ChatVisibility } from 'src/enums/chat-visibility.enum';
import { NotificationsService } from '../notification/notification.service';
import { NotificationType } from 'src/enums/notification-type.enum';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Chat.name) private readonly chatModel: Model<Chat>,
    @InjectModel(Message.name) private readonly messageModel: Model<Message>,
    private readonly userService: UserService,
    private readonly coursesService: CoursesService,
    private readonly notificationService: NotificationsService
  ){}



  // 1. Get all chats of a student
  async getChatsOfAStudentOrFail(studentId: Types.ObjectId): Promise<Chat[]> {
    const chats =  await this.chatModel.find({ participants: studentId }).populate('participants').exec();
    console.log(chats);
    return chats;
  }

  // 2. Get a certain chat by ID 
  async getChatByIdOrFail(chatId: Types.ObjectId): Promise<Chat> {
    const chat = await this.chatModel.findById(new Types.ObjectId(chatId)).populate('participants').exec();
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
    const { receiver_id, course_id } = createDirectChatDto;
    const receiverUser = await this.userService.findUserById(receiver_id.toString());
    if (!receiverUser) {
      throw new EntityDoesNotExistException('User', receiver_id.toString());
    }

    if( receiverUser.role == Role.Instructor || receiverUser.role == Role.Admin){
      throw new BadRequestException('student cannot chat with instructor or admin');
    }

    const course = await this.coursesService.findOne(course_id);
    if (!course) {
      throw new EntityDoesNotExistException('Course', course_id.toString());
    }

    if(user.role == Role.Instructor 
      && course.instructor_id._id.toString() !== initiator.toString()){
        throw new BadRequestException('Instructor is not the instructor of this course');
    }

    if(user.role == Role.Student
      && !course.students.some((student) => student._id.toString() === initiator.toString())){
        throw new BadRequestException('Student is not enrolled in this course');
    }

    if(!course.students.some((student) => student._id.toString() === receiver_id.toString())){
        throw new BadRequestException('Student is not enrolled in this course');
    }
    
    const newChat = new this.chatModel({ participants: [initiator, receiver_id], chat_name: createDirectChatDto.chatName, chat_type: ChatType.Direct, course_id: course_id, visibility:ChatVisibility.PRIVATE });  
    const savedChat =  await newChat.save();
    return savedChat;
  }

  async createGroupChatOrFail(createGroupChatDto:CreateGroupChatDto, initiator:  Types.ObjectId): Promise<Chat> {
    console.log(createGroupChatDto);
    const user = await this.userService.findUserById(initiator.toString());
    const { chatName, course_id, participants, visibility } = createGroupChatDto;
    const course = await this.coursesService.findOne(course_id);
    console.log(course);
    if (!course) {
      throw new EntityDoesNotExistException('Course', course_id.toString());
    }

    if(user.role == Role.Instructor 
      && course.instructor_id._id.toString() !== initiator.toString()){
        throw new BadRequestException('Instructor is not the instructor of this course');
    }

    if(user.role == Role.Student
      && !course.students.some((student) => student._id.toString() === initiator.toString())){
        throw new BadRequestException('Student is not enrolled in this course');
    }
    const validParticipants = [];
    validParticipants.push(initiator);

    for (const participant of participants) { 
      console.log("loop ", participant);

      if (
        course.students.some((student) => student._id.toString() === participant.toString()) ||
        (course.instructor_id._id.toString() === participant.toString() && user.role !== Role.Student)
      ) {
        console.log('valid');
        validParticipants.push(participant);
      }
    }

    console.log(validParticipants);

    const newChat = new this.chatModel({ participants: validParticipants, chat_name: chatName, chat_type: ChatType.Group, course_id: course_id, visibility:visibility  });
    const savedChat = await newChat.save();
    return savedChat;
  }

  //7. Add participants to a chat
  async addParticipantToChatOrFail( chat_id: Types.ObjectId ,addParticipantDto:AddParticipantDto, initiator:  Types.ObjectId): Promise<Chat> {
    const  participants = addParticipantDto.participants;
    console.log(participants);  
    console.log(chat_id);
    const chat = await this.chatModel.findOne({ _id: chat_id }).exec();
    console.log(chat);
    if (!chat) {
      throw new EntityDoesNotExistException('Chat', chat_id.toString());
    }    

    if(chat.chat_type == ChatType.Direct){
      throw new BadRequestException('Cannot add participants to a direct chat');
    }

    const course = await this.coursesService.findOne(chat.course_id);
    console.log(course);
    const user = await this.userService.findUserById(initiator.toString());
    console.log(user);
    const validParticipants = [];
    for (const participant of participants) { 

      console.log(participant);
      const addedUser = await this.userService.findUserById(participant.toString());
      if(user.role == Role.Student
        && addedUser.role == Role.Instructor){
          throw new BadRequestException('Student cannot add instructor');
      }

      if (chat.participants.includes(participant)) {
        throw new BadRequestException('Participant already in chat');
      }

      if (
        course.students.some((student) => student._id.toString() === participant.toString()) ||
        (course.instructor_id._id.toString() === participant.toString() && user.role !== Role.Student)
      ) {
        chat.participants.push(participant);   
      }
    }
    const chatsaved = await (chat as ChatDocument).save();
    return chatsaved;
  }

  // 8. Add a message to a chat
  async addMessageToChatOrFail(chat_id:Types.ObjectId, addMessageDto:AddMessageDto, sender_id: Types.ObjectId): Promise<Message> {

    const { content } = addMessageDto;
    const user = await this.userService.findUserById(sender_id.toString());
    const chat = await this.chatModel.findOne({ _id: chat_id }).exec();
    console.log(chat);
    console.log(user);
    if (!chat) {
      throw new EntityDoesNotExistException('Chat', chat_id.toString());
    }
    const participantExists = chat.participants.some(participant =>
      participant.toString()===sender_id.toString()
    );

    console.log(participantExists);
    if (!participantExists) {
      throw new BadRequestException('Sender is not a participant in this chat');
    }

    const message = new this.messageModel({
      chat_id: chat_id,
      sender_id: sender_id,
      content: content,    
      sender_name: user.name 
    });
    console.log(message);

    const savedMessage = await message.save();
    chat.messages.push(savedMessage._id);
    await chat.save();

    for (const participant of chat.participants){
      if(participant.toString() !== sender_id.toString()){
        console.log("participant", participant);
        await this.notificationService.createNotificationForChat(participant.toString(), chat_id, chat.chat_name);
    }
  }
    // Save the new message
    return savedMessage;
  }


  // 9. Update chat type of a chat
  async updateChatNameOrFail(chatId: Types.ObjectId, chatName: string, initiator: Types.ObjectId): Promise<Chat> {
    const chat = await this.chatModel.findOne({ _id: chatId }).exec();
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }    
    
    const participantExists = chat.participants.some(participant =>
      participant.toString()===initiator.toString()
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
   
    if (chat.participants.length < 2) {
      chat.isArchived = true;
    }

    return await (chat as ChatDocument).save();
  }

  async getMessagesByChatId(chatId: Types.ObjectId, initiator:  Types.ObjectId, timestamp?: string): Promise<Message[]>{
    const chat = await this.chatModel.findOne({ _id: chatId }).populate('messages').exec();

    if (!chat) {
      throw new EntityDoesNotExistException('Chat', chatId.toString());
    }

    const participantExists = chat.participants.some(participant =>
      participant.toString()===initiator.toString()
    );

    if (!participantExists) {
      throw new BadRequestException('Sender is not a participant in this chat');
    }
  
    // Extract the populated messages
    let messages;
    if (timestamp) {
      messages = await this.messageModel.find({ 
      _id: { $in: chat.messages },
      timestamp: { $gt: new Date(timestamp) }
      }).sort({ timestamp: 1 }).exec();
    } else {
      messages = await this.messageModel.find({ _id: { $in: chat.messages } }).sort({ timestamp: 1 }).exec();
    }
  
    return messages;
  }
  async getPublicChatsOfCourse(courseId: Types.ObjectId){
    const course = await this.coursesService.findOne(courseId);
    console.log("pub chat", course);
    if (!course) {
      throw new EntityDoesNotExistException('Course', courseId.toString());
    }
    console.log("hi from public", course)
    return this.chatModel.find({ course_id: course._id.toString(), chat_type: ChatType.Group, visibility:ChatVisibility.PUBLIC }).exec();
  }

  async getPublicGroupChats(userId:string){
    console.log(userId);  
    const user = await this.userService.findUserById(userId);
    if (!user) {
      throw new EntityDoesNotExistException('User', userId);
    }
    console.log(user);
    const chats = []
    if(user.role == Role.Student){
    const courses = await this.userService.getEnrolledCoursesOfStudent(userId);
    for(const course of courses){
      const chatsOfCourse = await this.getPublicChatsOfCourse(course.id);
      chats.push(...chatsOfCourse.filter(chat => !chat.participants.some(participant => participant.toString() === userId)));
    }
  }  
  if(user.role == Role.Instructor){
    const courses = await this.userService.getCoursesByInstructor(userId);
    console.log("hi", courses);
    for(const course of courses){
      console.log("hello", course);
      const chatsOfCourse = await this.getPublicChatsOfCourse(course._id);
      chats.push(...chatsOfCourse); 
    }
  }
  return chats;
} 

async getPotentialParticipants(course_id:string, userId:string){
  const user = await this.userService.findUserById(userId);
  const course = await this.coursesService.findOne(new Types.ObjectId(course_id));
  if (!user) {
    throw new EntityDoesNotExistException('User', userId);
  }
  if (!course) {
    throw new EntityDoesNotExistException('Course', course_id);
  }

  const participants = [];
  const students = course.students;
  for(const student of students){
    if(student._id.toString() !== userId){  
      participants.push(await this.userService.findUserById(student._id.toString()));
  }
  }
  return participants;
 }

 async getNewMessages(chat_id: string, timestamp?: string): Promise<Message[]> {
  // Define the base query to filter by chat_id
  const query: any = { _id: chat_id };  // Use `chat_id` instead of `_id`

  console.log("queryyy", query);

  // If timestamp is provided, filter for messages newer than the timestamp
  if (timestamp) {
    query.timestamp = { $gt: new Date(timestamp) };  // $gt is used to filter messages greater than the timestamp
  }

  console.log("time queryy", query.timestamp);

  // Fetch messages sorted by timestamp in ascending order (oldest first)
  const result = await this.messageModel.find(query).sort({ timestamp: 1 }).exec();

  console.log(result);

  // Return the result
  return result;
}

}
