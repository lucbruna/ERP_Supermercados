import { initTracing, TracingInterceptor } from '@crm/tracing';
initTracing('fiscal-service');

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as helmet from 'helmet';
import { AppModule } from './app.module';
import { createLogger, CrmLoggerService } from '@crm/logging';

async function bootstrap() {
  const logger = createLogger({ serviceName: 'Fiscal-Service' });
  const app = await NestFactory.create(AppModule);

  app.useGlobalInterceptors(new TracingInterceptor());
  app.useLogger(new CrmLoggerService('Fiscal-Service'));

  app.setGlobalPrefix('api/v1/fiscal');

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
    .setTitle('Fiscal Service - CRM Supermercado')
    .setDescription('Fiscal Brazil module - SEFAZ integration for NF-e/NFC-e/CT-e/MDF-e, SPED, and tax calculation')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('CFOP')
    .addTag('NF-e')
    .addTag('NFC-e')
    .addTag('SPED')
    .addTag('Configuração')
    .addTag('Tributos')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs/fiscal', app, document);

  const port = process.env.PORT || 3015;
  await app.listen(port);
  logger.info(`Fiscal Service running on port ${port}`);
}
bootstrap();
