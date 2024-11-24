import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService); 

  const config = new DocumentBuilder()
  .setTitle('The Study Buddies')
  .setDescription('The Study Buddies API Documentation')
  .setVersion('1.0')
  .build();

  const document = SwaggerModule.createDocument(app, config);
  
  SwaggerModule.setup('api', app, document);

  const port = configService.get<number>('PORT') ?? 5000; 
  await app.listen(port)
    .then(() => {
      console.log(`Application is running on http://localhost:${port}`);
    })
    .catch((err) => {
      console.error('Error starting the application:', err);
    });
}
bootstrap();
