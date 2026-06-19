import { initTracing, TracingInterceptor } from '@crm/tracing';
initTracing('codigo-barras-service');

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as helmet from 'helmet';
import { AppModule } from './app.module';
import { createLogger, CrmLoggerService } from '@crm/logging';

async function bootstrap() {
  const logger = createLogger({ serviceName: 'CodigoBarrasService' });
  const app = await NestFactory.create(AppModule);

  app.useGlobalInterceptors(new TracingInterceptor());
  app.useLogger(new CrmLoggerService('CodigoBarrasService'));

  app.setGlobalPrefix('api/v1/codigo-barras');

  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.use(helmet.default({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Código de Barras Service - ERP Supermercado')
    .setDescription('API de Geração e Gerenciamento de Códigos de Barras e Etiquetas')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs/codigo-barras', app, document);

  const port = process.env.PORT || 3012;
  await app.listen(port);
  logger.info(`Código de Barras Service running on port ${port}`);
}

bootstrap();
