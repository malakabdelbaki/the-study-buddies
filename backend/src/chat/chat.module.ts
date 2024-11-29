import { Module } from '@nestjs/common';
import { ChatGateway } from './chat-gateway';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
// import { ValidatorsModule } from 'src/common/validators/validators.module';
import { MongooseModule} from '@nestjs/mongoose';
import { Chat, ChatSchema } from '../Models/chat.schema';
import { User, UserSchema } from '../Models/user.schema';
import { Message, MessageSchema } from '../Models/message.schema';
import { UserModule } from '../users/users.module';
import { UserService } from '../users/users.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Chat.name, schema: ChatSchema },
      { name: User.name, schema: UserSchema },
      { name: Message.name, schema: MessageSchema },
    ]),
    // ValidatorsModule,
    UserModule,
  ],
  controllers: [ChatController],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}
