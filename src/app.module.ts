import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PerformanceModule } from './performance/performance.module';

@Module({
  imports: [PerformanceModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
