import { SetMetadata } from '@nestjs/common';

export const LogEvent = (message: string) => SetMetadata('logMessage', message);
