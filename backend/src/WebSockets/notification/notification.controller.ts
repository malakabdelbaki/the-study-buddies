import { Controller, Get , Param, UseGuards} from '@nestjs/common';
import { ApiTags, ApiParam } from '@nestjs/swagger';
import { NotificationsService } from './notification.service';
import { AuthGuard } from 'src/auth/guards/authentication.guard';
import { authorizationGuard } from 'src/auth/guards/authorization.guard';
import { SetMetadata } from '@nestjs/common';
import { Role } from 'src/enums/role.enum';
import { ROLES_KEY } from 'src/auth/decorators/roles.decorator';

@UseGuards(AuthGuard)
@UseGuards(authorizationGuard)
@Controller('notification')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationsService,
  ) {}

  @Get(':userId')
  @ApiTags('Notification')
  @ApiParam({ name: 'userId', type: String })
  @SetMetadata( ROLES_KEY, [Role.Student])
  async getNotificationsForUser(@Param('userId') userId: string) {
    return this.notificationService.getNotificationsForUser(userId);
  }
}
