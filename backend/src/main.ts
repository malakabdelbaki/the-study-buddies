import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import mongoose from 'mongoose';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    transform: true, // Enable transformation
    whitelist: true, // Remove properties not defined in DTO
 })); // Enable global validation

  const configService = app.get(ConfigService); 

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('The Study Buddies')
    .setDescription('The Study Buddies API Documentation')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // MongoDB connection
  const mongoConnectionString = configService.get<string>('MONGO_CONNECTION');
  try {
    const connection = await mongoose.connect(mongoConnectionString);
    console.log('Connected to MongoDB:', connection.connection.name);
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
  }

  // Start the application
  const port = configService.get<number>('PORT') ?? 5000; 
  await app.listen(port)
    .then(() => {
      console.log(`Application is running on http://localhost:${port}`);
    })
    .catch((err) => {
      console.error('Error starting the application:', err);
    });
}

//cors

bootstrap();
