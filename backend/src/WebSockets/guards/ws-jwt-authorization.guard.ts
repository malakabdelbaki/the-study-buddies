import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Socket } from 'socket.io';
import { ROLES_KEY } from '../../auth/decorators/roles.decorator';
import { Role } from '../../enums/role.enum';
import { AuthenticatedSocket } from '../authenticated.socket';
import { WsException } from '@nestjs/websockets';
@Injectable()
export class WsAuthorizationGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const client: AuthenticatedSocket = context.switchToWs().getClient<AuthenticatedSocket>();
    if (!client.user) {
      throw new WsException('User not authenticated');
    }

    if (!requiredRoles.includes(client.user.role)) {
      throw new WsException(`User role ${client.user.role} is not authorized. Required roles: ${requiredRoles.join(', ')}`);
    }

    return true;
  }
}
