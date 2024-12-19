import { Injectable } from '@nestjs/common';
import { createLogger, format, transports } from 'winston';
import 'winston-mongodb';
import { MongoClient } from 'mongodb'; // Import MongoDB client for querying logs

@Injectable()
export class LogsService {
  private readonly logger = createLogger({
    level: 'info',
    format: format.combine(format.timestamp(), format.json()),
    transports: [
      new transports.Console({
        handleExceptions: true, //ensures app won't crash if logging fails
        format: format.combine(
          format.colorize(),
          format.printf(({ level, message, timestamp }) => `[${timestamp}] ${level}: ${message}`),
        ),
      }), // Console logging for debugging
      
      new transports.MongoDB({
        level: 'info',
        db: process.env.MONGO_CONNECTION, // check :')
        collection: 'application_logs',
        //options: { useUnifiedTopology: true },
      }),
    ],
    exitOnError: false,
  });

  logInfo(message: string, meta?: Record<string, any>) {
    this.logger.info(message, meta);
  }

  logError(message: string, meta?: Record<string, any>) {
    this.logger.error(message, meta);
  }

  logDebug(message: string, meta?: Record<string, any>) {
    this.logger.debug(message, meta);
  }

  // Method to retrieve logs from MongoDB
  async getLogs(query: any = {}, limit: number = 50): Promise<any[]> {
    const client = new MongoClient(process.env.MONGO_CONNECTION)
    try {
      await client.connect(); // Connect to MongoDB
      const db = client.db(); // Get default database
      const collection = db.collection('application_logs'); // Access the 'application_logs' collection

      // Query logs with limit and sort
      const logs = await collection.find(query).limit(limit).sort({ timestamp: -1 }).toArray();
      return logs;
    } catch (error) {
      throw new Error('Error fetching logs: ' + error.message);
    } finally {
      await client.close(); // Ensure the connection is closed after the operation
    }
  }
  
}

