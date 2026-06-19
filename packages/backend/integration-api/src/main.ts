import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { createLogger, CrmLoggerService } from '@crm/logging';

async function bootstrap() {
  const logger = createLogger({ serviceName: 'Integration-API' });
  const app = await NestFactory.create(AppModule);

  app.useLogger(new CrmLoggerService('Integration-API'));

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('Integration API - ERP Supermercado')
    .setDescription('E-commerce, Balança e Coletor')
    .setVersion('1.0')
    .addTag('E-commerce')
    .addTag('Balança')
    .addTag('Coletor (Scanner)')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3016;
  await app.listen(port);
  logger.info(`Integration API running on port ${port}`);
}
bootstrap();
