import { initTracing, TracingInterceptor } from '@crm/tracing';
initTracing('bi-service');

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { createLogger, CrmLoggerService } from '@crm/logging';

async function bootstrap() {
  const logger = createLogger({ serviceName: 'BIService' });
  const app = await NestFactory.create(AppModule);

  app.useGlobalInterceptors(new TracingInterceptor());
  app.useLogger(new CrmLoggerService('BIService'));

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('BI Service')
    .setDescription('ERP Supermercado - Business Intelligence Microservice')
    .setVersion('1.0')
    .addTag('kpis', 'KPI management')
    .addTag('relatorios', 'Report generation')
    .addTag('dashboards', 'Dashboard configuration')
    .addTag('indicadores', 'Indicator definitions')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3012;
  await app.listen(port);
  logger.info(`BI service running on port ${port}`);
}

bootstrap();
