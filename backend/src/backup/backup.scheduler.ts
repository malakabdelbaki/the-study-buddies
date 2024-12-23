import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { BackupService } from './backup.service';
import { LogsService } from 'src/log/log.service';

@Injectable()
export class BackupScheduler {
  constructor(
    private readonly backupService: BackupService,
    private readonly logsService: LogsService
  ) {}

  @Cron('0 0 * * *') // Runs daily at midnight
  // @Cron('*/5 * * * *') // Runs every 5 minutes (for testing!)
  async handleCron() {
    this.logsService.logInfo('Backup job started.');
    await this.backupService.backupDatabase();
    this.logsService.logInfo('Backup job finished.');
  }
}
