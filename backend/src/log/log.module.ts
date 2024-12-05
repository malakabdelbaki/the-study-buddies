import { Module } from '@nestjs/common';
import { LogsService } from './log.service';
import { LogInterceptor } from './log.interceptor';

@Module({
  providers: [LogsService, LogInterceptor],
  exports: [LogsService, LogInterceptor],
})
export class LogsModule {}

//const logsService = app.get(LogsService); // Retrieve LogsService instance
//app.useGlobalFilters(new AllExceptionsFilter(logsService)); // Register the filter
//app.useGlobalInterceptors(new LogInterceptor(new LogsService())); //to use globally in main.ts
