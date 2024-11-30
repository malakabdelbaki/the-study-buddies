import { Controller, Get , Param} from '@nestjs/common';
import { ApiTags, ApiParam } from '@nestjs/swagger';
import { NotificationsService } from './notification.service';

@Controller('notification')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationsService,
  ) {}

  @Get(':userId')
  @ApiTags('Notification')
  @ApiParam({ name: 'userId', type: String })
  async getNotificationsForUser(@Param('userId') userId: string) {
    return this.notificationService.getNotificationsForUser(userId);
  }
}
