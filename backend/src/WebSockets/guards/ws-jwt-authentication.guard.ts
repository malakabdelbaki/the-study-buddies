import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const client = context.switchToWs().getClient();
    const authHeader = client.handshake.headers.authorization;

    if (!authHeader) {
      throw new WsException('Missing Authorization header');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new WsException('Invalid Authorization header format');
    }

    try {
      const payload = this.jwtService.verify(token);
      client.user = payload.userId; // Attach the user to the socket instance
      client.role = payload.role; // Attach the user's role to the socket instance
      return true;
    } catch (err) {
      throw new WsException('Invalid or expired token');
    }
  }
}
