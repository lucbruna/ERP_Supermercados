import { initTracing, TracingInterceptor } from '@crm/tracing';
initTracing('base-brasil');

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { createLogger, CrmLoggerService } from '@crm/logging';

async function bootstrap() {
  const logger = createLogger({ serviceName: 'BaseBrasil' });
  const app = await NestFactory.create(AppModule);

  app.useGlobalInterceptors(new TracingInterceptor());
  app.useLogger(new CrmLoggerService('BaseBrasil'));

  app.setGlobalPrefix('api/v1');

  app.use(helmet());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Base Brasil - ERP Supermercado')
    .setDescription('Brazilian localization data and validation utilities (CEP, IBGE, NCM, CFOP, CNAE, CEST)')
    .setVersion('1.0')
    .addTag('CEP')
    .addTag('IBGE')
    .addTag('NCM')
    .addTag('CFOP')
    .addTag('Validação')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3020;
  await app.listen(port);
  logger.info(`Base Brasil running on port ${port}`);
}
bootstrap();
