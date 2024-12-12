import { Module } from '@nestjs/common';
import { ChatModule } from './chat/chat.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [ChatModule, NotificationModule],
})
export class WebSocketsModule {}
