import { Module } from '@nestjs/common';
import { ChatGateway } from './chat-gateway';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
//// import { ValidatorsModule } from 'src/common/validators/validators.module';
import { MongooseModule} from '@nestjs/mongoose';
import { Chat, ChatSchema } from '../../Models/chat.schema';
import { User, UserSchema } from '../../Models/user.schema';
import { Message, MessageSchema } from '../../Models/message.schema';
import { UserModule } from '../../users/users.module';
import { UserService } from '../../users/users.service';
import { CoursesModule } from 'src/courses/courses.module';
import { WsJwtGuard } from '../guards/ws-jwt-authentication.guard'
import { WsAuthorizationGuard } from '../guards/ws-jwt-authorization.guard'
import { AuthModule } from 'src/auth/auth.module';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Chat.name, schema: ChatSchema },
      { name: User.name, schema: UserSchema },
      { name: Message.name, schema: MessageSchema },
    ]),
  //  // ValidatorsModule,
    UserModule,
    CoursesModule,
    AuthModule
  ],
  controllers: [ChatController],
  providers: [ChatGateway, ChatService, WsJwtGuard, WsAuthorizationGuard],
})
export class ChatModule {}