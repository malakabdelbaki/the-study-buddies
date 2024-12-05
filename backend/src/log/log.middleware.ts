//redundant is log interceptor does the same thing

/**import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LogsService } from './log.service';

@Injectable()
export class LogsMiddleware implements NestMiddleware {
  constructor(private readonly logsService: LogsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const log = {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      timestamp: new Date().toISOString(),
    };

    this.logsService.logInfo('Incoming Request', log);
    next();
  }
}
*/