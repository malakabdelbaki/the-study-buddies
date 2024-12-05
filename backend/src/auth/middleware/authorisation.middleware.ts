
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { LogsService } from '../../log/log.service';

/**
* Checks if the user has access to requested endpoint
* @param req - Express Request Object
* @param response - Express Response Object
* @param next - Express Next Function
* 
* @returns next Function or Throws an Error if user is not authenticated
*/
@Injectable()
export class AuthorizationMiddleware { //changed middleware from a function to a class due to errors in using logService
  constructor(private logsService: LogsService) {}

  isUserAuthorized(roles: String[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!roles.includes(req['user']?.role)) {
        this.logsService.logError('Authorization failed: User does not have the required role', {
          userId: req['user']?.id || 'unknown',
          role: req['user']?.role || 'unknown',
          requiredRoles: roles,
        });
        throw new UnauthorizedException('User does not have the required role');
      }
      next();
    };
  }
}