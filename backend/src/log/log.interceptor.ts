import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LogsService } from './log.service';

@Injectable()
export class LogInterceptor implements NestInterceptor {
  constructor(private readonly logsService: LogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const logMessage = this.getLogMessage(context);
    
    const meta = {
      method: req.method,
      url: req.originalUrl,
      user: req.user || 'Anonymous',
      ip: req.ip,
    };

    return next.handle().pipe(
      tap(() => {
        if (logMessage) {
          this.logsService.logInfo(logMessage, meta);
        } else{
          this.logsService.logInfo('Request handled', meta);
        }
      }),
    );
  }

  private getLogMessage(context: ExecutionContext): string | null {
    const handler = context.getHandler();
    return Reflect.getMetadata('logMessage', handler);
  }
}

/** this.loggerService.log({
  level: 'info',
  message: logMessage,
  route: originalUrl,
  method,
  ip,
  user: {
    userId: user.userid || null,
    email: user.email || null,
    role: user.role || null,
  },
  timestamp: new Date(),
}); */