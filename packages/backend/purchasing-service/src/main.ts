import { initTracing, TracingInterceptor } from '@crm/tracing';
initTracing('purchasing-service');

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { createLogger, CrmLoggerService } from '@crm/logging';

async function bootstrap() {
  const logger = createLogger({ serviceName: 'PurchasingService' });
  const app = await NestFactory.create(AppModule);

  app.useGlobalInterceptors(new TracingInterceptor());
  app.useLogger(new CrmLoggerService('PurchasingService'));

  app.setGlobalPrefix('api/v1/compras');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('ERP Supermercado - Compras API')
    .setDescription('Microserviço de Compras')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/compras/docs', app, document);

  const port = process.env.PORT || 3009;
  await app.listen(port);
  logger.info(`Purchasing Service running on port ${port}`);
}
bootstrap();
