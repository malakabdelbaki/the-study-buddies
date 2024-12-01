// import { Test, TestingModule } from '@nestjs/testing';
// import { ChatController } from './chat.controller';
// import { ChatService } from './chat.service';
// import { ChatType } from 'src/enums/chat-type.enum';
// import { Types } from 'mongoose';
// import { BadRequestException, NotFoundException } from '@nestjs/common';

// describe('ChatController', () => {
//   let controller: ChatController;
//   let service: ChatService;

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

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       controllers: [ChatController],
//       providers: [
//         {
//           provide: ChatService,
//           useValue: {
//             getChatsOrFail: jest.fn().mockResolvedValue([mockChat]),
//             getChatOfStudentByIdOrFail: jest.fn().mockResolvedValue(mockChat),
//             searchChats: jest.fn().mockResolvedValue([mockChat]),
//             createChat: jest.fn().mockResolvedValue(mockChat),
//             addParticipantToChatOrFail: jest.fn().mockResolvedValue(mockChat),
//             addMessageToChatOrFail: jest.fn().mockResolvedValue(mockChat),
//             updateChatTypeOrFail: jest.fn().mockResolvedValue(mockChat),
//             leaveChatOrFail: jest.fn().mockResolvedValue(mockChat),
//           },
//         },
//       ],
//     }).compile();

//     controller = module.get<ChatController>(ChatController);
//     service = module.get<ChatService>(ChatService);
//   });

//   describe('getChatsOfStudent', () => {
//     it('should return a list of chats for a student', async () => {
//       const studentId = new Types.ObjectId().toString();
//       const result = await controller.getChatsOfStudent(studentId);
//       expect(result).toEqual([mockChat]);
//       expect(service.getChatsOrFail).toHaveBeenCalledWith(new Types.ObjectId(studentId));
//     });
//   });

//   describe('getChatOfStudentById', () => {
//     it('should return a specific chat for a student', async () => {
//       const studentId = new Types.ObjectId().toString();
//       const chatId = new Types.ObjectId().toString();
//       const result = await controller.getChatOfStudentById(studentId, chatId);
//       expect(result).toEqual(mockChat);
//       expect(service.getChatOfStudentByIdOrFail).toHaveBeenCalledWith(new Types.ObjectId(studentId), new Types.ObjectId(chatId));
//     });

//     it('should throw an exception if chat is not found', async () => {
//       const studentId = new Types.ObjectId().toString();
//       const chatId = new Types.ObjectId().toString();
//       jest.spyOn(service, 'getChatOfStudentByIdOrFail').mockRejectedValueOnce(new NotFoundException());
//       await expect(controller.getChatOfStudentById(studentId, chatId)).rejects.toThrow(NotFoundException);
//     });
//   });

//   describe('createChat', () => {
//     it('should create a new chat', async () => {
//       const createChatDto = { participants: [new Types.ObjectId()], chatType: ChatType.PRIVATE };
//       const result = await controller.createChat(createChatDto);
//       expect(result).toEqual(mockChat);
//       expect(service.createChat).toHaveBeenCalledWith(createChatDto.participants, createChatDto.chatType);
//     });
//   });
// });
