// import { Test, TestingModule } from '@nestjs/testing';
// import { ChatService } from './chat.service';
// import { getModelToken } from '@nestjs/mongoose';
// import { Chat } from '../Models/chat.schema';
// import { User } from '../Models/user.schema';
// import { Message } from '../Models/message.schema';
// import { Types } from 'mongoose';
// import { BadRequestException, NotFoundException } from '@nestjs/common';
// import { ChatType } from 'src/enums/chat-type.enum';

// describe('ChatService', () => {
//   let service: ChatService;
//   let chatModel: any;
//   let userModel: any;
//   let messageModel: any;

//   const mockChat = {
//     _id: new Types.ObjectId(),
//     participants: [new Types.ObjectId()],
//     chatType: 'private',
//     messages: [],
//   };

//   const mockUser = {
//     _id: new Types.ObjectId(),
//     role: 'Student',
//   };

//   const mockMessage = {
//     _id: new Types.ObjectId(),
//     content: 'Test message',
//   };

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         ChatService,
//         {
//           provide: getModelToken(Chat.name),
//           useValue: {
//             find: jest.fn().mockResolvedValue([mockChat]),
//             findOne: jest.fn().mockResolvedValue(mockChat),
//             save: jest.fn().mockResolvedValue(mockChat),
//           },
//         },
//         {
//           provide: getModelToken(User.name),
//           useValue: {
//             findOne: jest.fn().mockResolvedValue(mockUser),
//             find: jest.fn().mockResolvedValue([mockUser]),
//           },
//         },
//         {
//           provide: getModelToken(Message.name),
//           useValue: {
//             find: jest.fn().mockResolvedValue([mockMessage]),
//           },
//         },
//       ],
//     }).compile();

//     service = module.get<ChatService>(ChatService);
//     chatModel = module.get(getModelToken(Chat.name));
//     userModel = module.get(getModelToken(User.name));
//     messageModel = module.get(getModelToken(Message.name));
//   });

//   describe('getChatsOrFail', () => {
//     it('should return a list of chats for a student', async () => {
//       const studentId = new Types.ObjectId();
//       const result = await service.getChatsOrFail(studentId);
//       expect(result).toEqual([mockChat]);
//       expect(chatModel.find).toHaveBeenCalledWith({ participants: studentId });
//     });

//     it('should throw an exception if student is not found', async () => {
//       const studentId = new Types.ObjectId();
//       jest.spyOn(userModel, 'findOne').mockResolvedValueOnce(null);
//       await expect(service.getChatsOrFail(studentId)).rejects.toThrow(NotFoundException);
//     });
//   });

//   describe('getChatOfStudentByIdOrFail', () => {
//     it('should return a specific chat by ID', async () => {
//       const studentId = new Types.ObjectId();
//       const chatId = new Types.ObjectId();
//       const result = await service.getChatOfStudentByIdOrFail(studentId, chatId);
//       expect(result).toEqual(mockChat);
//       expect(chatModel.findOne).toHaveBeenCalledWith({ _id: chatId, participants: studentId });
//     });

//     it('should throw an exception if chat is not found', async () => {
//       const studentId = new Types.ObjectId();
//       const chatId = new Types.ObjectId();
//       jest.spyOn(chatModel, 'findOne').mockResolvedValueOnce(null);
//       await expect(service.getChatOfStudentByIdOrFail(studentId, chatId)).rejects.toThrow(NotFoundException);
//     });
//   });

//   describe('searchChats', () => {
//     it('should return a list of chats that match the search criteria', async () => {
//       const studentId = new Types.ObjectId();
//       const participants = [new Types.ObjectId()];
//       const chatType = ChatType.PRIVATE;
//       const query = 'Test message';
//       const result = await service.searchChats(studentId, participants, chatType, query);
//       expect(result).toEqual([mockChat]);
//       expect(messageModel.find).toHaveBeenCalledWith({
//         content: { $regex: query, $options: 'i' },
//       });
//     });

//     it('should handle invalid participants', async () => {
//       const studentId = new Types.ObjectId();
//       const invalidParticipants = [new Types.ObjectId()];
//       const chatType = ChatType.PRIVATE;
//       const query = 'Test message';
//       jest.spyOn(userModel, 'find').mockResolvedValueOnce([]);
//       await expect(service.searchChats(studentId, invalidParticipants, chatType, query)).rejects.toThrow(BadRequestException);
//     });
//   });

//   describe('createChat', () => {
//     it('should create a new chat', async () => {
//       const participants = [new Types.ObjectId()];
//       const chatType = ChatType.PRIVATE;
//       const result = await service.createChat(participants, chatType);
//       expect(result).toEqual(mockChat);
//       expect(chatModel.save).toHaveBeenCalled();
//     });

//     it('should throw an exception if one or more participants are invalid', async () => {
//       const participants = [new Types.ObjectId()];
//       const chatType = ChatType.PRIVATE;
//       jest.spyOn(userModel, 'find').mockResolvedValueOnce([]);
//       await expect(service.createChat(participants, chatType)).rejects.toThrow(BadRequestException);
//     });
//   });
// });
