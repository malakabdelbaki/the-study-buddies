import { Module } from '@nestjs/common';
import { BackupService } from './backup.service';
import { BackupScheduler } from './backup.scheduler';

@Module({
  providers: [BackupService, BackupScheduler],
})
export class BackupModule {}


//imports: [ScheduleModule.forRoot(),],