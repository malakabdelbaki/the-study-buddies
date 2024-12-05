import { Injectable } from '@nestjs/common';
import { createLogger, format, transports } from 'winston';
import 'winston-mongodb';

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
}

