import { Injectable } from '@nestjs/common';
import * as mongoose from 'mongoose';
import { LogsService } from 'src/log/log.service'; // Adjust import based on your logging folder location

@Injectable()
export class BackupService {
  constructor(private readonly logsService: LogsService) {}

  async backupDatabase(): Promise<void> {
    try {
      this.logsService.logInfo('Starting full database backup.');

      // Connect to both primary and backup databases
      const primaryConnection = mongoose.createConnection(process.env.MONGO_CONNECTION);
      const backupConnection = mongoose.createConnection(process.env.MONGO_BACKUP_CONNECTION);

      await primaryConnection.asPromise();
      await backupConnection.asPromise();

      // Log the status of the connections (debugging!)
      this.logsService.logInfo('Primary DB connected:', { status: primaryConnection.readyState });
      this.logsService.logInfo('Backup DB connected:', { status: backupConnection.readyState });

      if (!primaryConnection.db) {
        this.logsService.logError('Primary connection database object is undefined.');
        return;
      }

      // Get all collections in the primary database
      const collections = await primaryConnection.db.listCollections().toArray();



      for (const collection of collections) {
        const collectionName = collection.name;
        this.logsService.logInfo(`Backing up collection: ${collectionName}`);

        // Fetch data from the primary database collection
        const data = await primaryConnection.db.collection(collectionName).find().toArray();

        // Clear the corresponding collection in the backup database
        await backupConnection.db.collection(collectionName).deleteMany({});

        // Insert data into the backup database
        if (data.length > 0) {
          await backupConnection.db.collection(collectionName).insertMany(data);
        }

        this.logsService.logInfo(`Successfully backed up collection: ${collectionName}`, { collectionName });
      }

      // Close connections
      await primaryConnection.close();
      await backupConnection.close();

      this.logsService.logInfo('Full database backup completed successfully.');
    } catch (error) {
      this.logsService.logError('Error during database backup.', { error: error.message, stack: error.stack });
    }
  }
}