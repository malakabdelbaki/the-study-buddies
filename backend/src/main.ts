import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import mongoose from 'mongoose';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

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

    //cors
    const allowedOrigins = [`http://localhost:${port}`]; //to be more dynamic and allow more origins if needed in the future
    app.enableCors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) { //!origin to allow testing like postman as they have no origin
          callback(null, true); // Allow access
        } else {
          callback(new Error('Not allowed by CORS')); // Reject access
        }
      },
      methods:'GET,POST,PUT,PATCH,DELETE', //allowed methods
      credentials: true, //allows cookies/autorisation headers to be sent with request
    });
    //parses cookies from the incoming HTTP requests and makes them available in the request.cookies object
    app.use(cookieParser())
}



bootstrap();
