import { initTracing, TracingInterceptor } from '@crm/tracing';
initTracing('distribution-service');

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { createLogger, CrmLoggerService } from '@crm/logging';

async function bootstrap() {
  const logger = createLogger({ serviceName: 'DistributionService' });
  const app = await NestFactory.create(AppModule);

  app.useGlobalInterceptors(new TracingInterceptor());
  app.useLogger(new CrmLoggerService('DistributionService'));

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Distribution Service')
    .setDescription('ERP Supermercado - Distribution and Logistics Microservice')
    .setVersion('1.0')
    .addTag('separacao', 'Order picking operations')
    .addTag('roteirizacao', 'Route planning and optimization')
    .addTag('veiculos', 'Vehicle management')
    .addTag('motoristas', 'Driver management')
    .addTag('expedicao', 'Dispatch operations')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3011;
  await app.listen(port);
  logger.info(`Distribution service running on port ${port}`);
}

bootstrap();
