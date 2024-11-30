//imcomplete!
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LogDocument, LogSchema } from 'src/Models/log.schema';

@Injectable()
export class LoggingService {
  constructor(@InjectModel('Log') private readonly logModel: Model<LogDocument>) {}

  async log(event: { action: string; userId?: string; success: boolean; ip?: string; timestamp?: string }) { //not compatible with schema
    const logEntry = new this.logModel({
      action: event.action,
      userId: event.userId || 'Guest',
      success: event.success,
      ip: event.ip || 'Unknown',
      timestamp: event.timestamp || new Date(),
    });

    await logEntry.save(); // Save log to MongoDB
    console.log('Logged event to MongoDB:', logEntry); // Optional: log to console
  }
}

