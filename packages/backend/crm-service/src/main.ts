import { initTracing, TracingInterceptor } from '@crm/tracing';
initTracing('crm-service');

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { createLogger, CrmLoggerService } from '@crm/logging';

async function bootstrap() {
  const logger = createLogger({ serviceName: 'CRM-Service' });
  const app = await NestFactory.create(AppModule);

  app.useGlobalInterceptors(new TracingInterceptor());
  app.useLogger(new CrmLoggerService('CRM-Service'));

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('CRM Service - ERP Supermercado')
    .setDescription('Cliente, Fidelidade, Cupons, Cashback, Pontos e Segmentação')
    .setVersion('1.0')
    .addTag('Clientes')
    .addTag('Fidelidade')
    .addTag('Cupons')
    .addTag('Cashback')
    .addTag('Pontos')
    .addTag('Segmentação')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3006;
  await app.listen(port);
  logger.info(`CRM Service running on port ${port}`);
}
bootstrap();
