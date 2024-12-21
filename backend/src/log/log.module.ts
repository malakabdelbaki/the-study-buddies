import { forwardRef, Module } from '@nestjs/common';
import { LogsService } from './log.service';
import { LogInterceptor } from './log.interceptor';
import { LogsController } from './log.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports:[forwardRef(() => AuthModule),],
  providers: [LogsService, LogInterceptor],
  controllers:[LogsController],
  exports: [LogsService, LogInterceptor],
})
export class LogsModule {}

//const logsService = app.get(LogsService); // Retrieve LogsService instance
//app.useGlobalFilters(new AllExceptionsFilter(logsService)); // Register the filter
//app.useGlobalInterceptors(new LogInterceptor(new LogsService())); //to use globally in main.ts
