//not very important, global handeling for errors

/** import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { LogsService } from './log.service'; // Adjust the import path based on your file structure

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private logsService: LogsService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    // Log the error
    this.logsService.logError('Unhandled exception occurred', {
      path: request.url,
      method: request.method,
      status,
      exception,
    });

    // Respond with the error
    response.status(status).json({
      statusCode: status,
      message: exception instanceof HttpException
        ? exception.message
        : 'Internal server error',
    });
  }
}
  */
