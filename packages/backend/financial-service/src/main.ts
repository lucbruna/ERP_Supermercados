import { initTracing, TracingInterceptor } from '@crm/tracing';
initTracing('financial-service');

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { createLogger, CrmLoggerService } from '@crm/logging';

async function bootstrap() {
  const logger = createLogger({ serviceName: 'FinancialService' });
  const app = await NestFactory.create(AppModule);

  app.useGlobalInterceptors(new TracingInterceptor());
  app.useLogger(new CrmLoggerService('FinancialService'));

  app.setGlobalPrefix('api/v1/financeiro');

  app.use(helmet());
  app.use(cookieParser());

  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Financial Service - ERP Supermercado')
    .setDescription('API de Gestão Financeira (Contas a Pagar/Receber, Fluxo de Caixa, Conciliação Bancária, PIX)')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs/financeiro', app, document);

  const port = process.env.PORT || 3003;
  await app.listen(port);
  logger.info(`Financial Service running on port ${port}`);
}

bootstrap();
