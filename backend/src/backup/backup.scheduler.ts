import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { BackupService } from './backup.service';

@Injectable()
export class BackupScheduler {
  constructor(private readonly backupService: BackupService) {}

  @Cron('0 0 * * *') // Runs daily at midnight
  async handleCron() {
    await this.backupService.backupDatabase();
  }
}
