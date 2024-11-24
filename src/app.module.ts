import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import dbconfig from './config/dbconfig';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ConfigModule.forRoot({envFilePath:'.env',isGlobal:true, load: [dbconfig]}),
    MongooseModule.forRootAsync({
      useFactory: async (configService:ConfigService) => ({
        uri: configService.get<string>('database.connectionString')
      }),
      inject:[ConfigService]
    })
    
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
