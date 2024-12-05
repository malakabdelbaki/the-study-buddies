//based on router we'll do useGuard(AuthGard), to say that this endpoint specifically needs authen
import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import * as dotenv from 'dotenv';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { LogsService } from '../log/log.service';
dotenv.config();

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private reflector: Reflector,
        private logsService: LogsService //to allow automatic logging during auth
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
          ]);
          if (isPublic) {
            return true;
          }
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            this.logsService.logError('Unauthorized access attempt: Missing token', { ip: request.ip }); //error log!
            throw new UnauthorizedException('No token, please login');
        }
        try {
            const payload = await this.jwtService.verifyAsync(
                token,
                {
                    secret: process.env.JWT_SECRET
                }
            );
            // 💡 We're assigning the payload to the request object here
            // so that we can access it in our route handlers
            request['user'] = payload;
        } catch {
            this.logsService.logError('Unauthorized access attempt: Invalid token', { ip: request.ip }); //error log!
            throw new UnauthorizedException('invalid token');
        }
        return true;
    }
    private extractTokenFromHeader(request: Request): string | undefined {
        const token = request.cookies?.token || request.headers['authorization']?.split(' ')[1];

        return token;
    }
}