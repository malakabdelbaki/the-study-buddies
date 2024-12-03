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

@Injectable()
export class WsAuthorizationGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get required roles from the decorator metadata
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are required, allow access
    if (!requiredRoles) {
      return true;
    }

    // Switch context to WebSocket and extract the client (socket) object
    const client: AuthenticatedSocket = context.switchToWs().getClient<AuthenticatedSocket>();
    const user = client.user; // Ensure user is attached to the socket

    if (!user) {
      throw new UnauthorizedException('No user attached to the socket');
    }

    const userRole = client.role;

    if (!requiredRoles.includes(userRole)) {
      throw new UnauthorizedException('Unauthorized access');
    }

    return true;
  }
}
