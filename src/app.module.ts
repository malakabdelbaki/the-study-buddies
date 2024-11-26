// import { Module } from '@nestjs/common';
// import { ConfigModule } from '@nestjs/config'; // Import ConfigModule
// import { AppController } from './app.controller';
// import { AppService } from './app.service';
// import { PerformanceModule } from './performance/performance.module'; // Import your feature module

// @Module({
//   imports: [
//     ConfigModule.forRoot({
//       isGlobal: true, // Makes ConfigModule available globally
//     }),
//     PerformanceModule, // Add the PerformanceModule
//   ],
//   controllers: [AppController],
//   providers: [AppService],
// })
//export class AppModule {}


// import { Module } from '@nestjs/common';
// import { ConfigModule } from '@nestjs/config';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';
// import { PerformanceModule } from './performance/performance.module';
// import { MongooseModule } from '@nestjs/mongoose';

// @Module({
//   imports: [PerformanceModule,  
//   MongooseModule.forRoot(process.env.DATABASE_URL) ],
//   controllers: [AppController],
//   providers: [AppService],
// })
// export class AppModule {}

// console.log('Connecting to MongoDB at:', process.env.MONGO_CONNECTION);

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PerformanceModule } from './performance/performance.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_CONNECTION),
    PerformanceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

