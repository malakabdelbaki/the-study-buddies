import { Module } from '@nestjs/common';
import { BackupService } from './backup.service';
import { BackupScheduler } from './backup.scheduler';
import { LogsModule } from 'src/log/log.module';

@Module({
  imports: [LogsModule],
  providers: [BackupService, BackupScheduler],
})
export class BackupModule {}


//imports: [ScheduleModule.forRoot(),],