import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { AuthenticatedSocket } from '../authenticated.socket';
import { Types } from 'mongoose';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: AuthenticatedSocket = context.switchToWs().getClient();
      const token = this.extractTokenFromHeader(client);
      
      if (!token) {
        throw new WsException('Authentication token is missing');
      }

      try {
        const payload = await this.jwtService.verifyAsync(token);
        client.user = {
          userid: new Types.ObjectId(payload.sub),
          role: payload.role,
          email: payload.email,
          name: payload.name
        };
        return true;
      } catch (jwtError) {
        throw new WsException('Invalid authentication token');
      }
    } catch (error) {
      throw new WsException(error.message || 'Authentication failed');
    }
  }

  private extractTokenFromHeader(client: AuthenticatedSocket): string | undefined {
    const authHeader = client.handshake.headers.authorization;
    if (!authHeader) return undefined;

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}

