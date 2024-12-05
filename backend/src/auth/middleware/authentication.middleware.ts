
//middleware is used in app module (outside)
import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import * as dotenv from 'dotenv';
dotenv.config();
import { LogsService } from 'src/log/log.service';

//changed middleware from a function to a class due to errors in using logService
@Injectable()
export class AuthenticationMiddleware implements NestMiddleware {
  constructor(private logsService: LogsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies?.token || req.headers['authorization']?.split(' ')[1];

    if (!token) {
      this.logsService.logError('Authentication failed: Missing token', { ip: req.ip }); // Log error
      throw new UnauthorizedException('Authentication token missing');
    }

    try {
      const decoded: any = verify(token, String(process.env.JWT_SECRET));
      req['user'] = decoded.user; // Attach user payload to the request object
      next();
    } catch (err) {
      this.logsService.logError('Authentication failed: Invalid token', { ip: req.ip }); // Log error
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}