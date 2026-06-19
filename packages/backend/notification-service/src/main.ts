import { initTracing, TracingInterceptor } from '@crm/tracing';
initTracing('notification-service');

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { createLogger, CrmLoggerService } from '@crm/logging';

async function bootstrap() {
  const logger = createLogger({ serviceName: 'NotificationService' });
  const app = await NestFactory.create(AppModule);

  app.useGlobalInterceptors(new TracingInterceptor());
  app.useLogger(new CrmLoggerService('NotificationService'));

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Notification Service')
    .setDescription('ERP Supermercado - Notification Microservice')
    .setVersion('1.0')
    .addTag('notificacoes', 'Notification management')
    .addTag('templates', 'Notification templates')
    .addTag('email', 'Email provider')
    .addTag('sms', 'SMS provider')
    .addTag('whatsapp', 'WhatsApp provider')
    .addTag('push', 'Push notifications provider')
    .addTag('notifications', 'Notification orchestration')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3014;
  await app.listen(port);
  logger.info(`Notification service running on port ${port}`);
}

bootstrap();
