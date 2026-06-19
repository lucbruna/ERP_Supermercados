import { initTracing, TracingInterceptor } from '@crm/tracing';
initTracing('ai-service');

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { createLogger, CrmLoggerService } from '@crm/logging';

async function bootstrap() {
  const logger = createLogger({ serviceName: 'AIService' });
  const app = await NestFactory.create(AppModule);

  app.useGlobalInterceptors(new TracingInterceptor());
  app.useLogger(new CrmLoggerService('AIService'));

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('AI Service')
    .setDescription('ERP Supermercado - Artificial Intelligence Microservice')
    .setVersion('2.0')
    .addTag('previsoes', 'Sales forecasting (legacy)')
    .addTag('recomendacoes', 'Intelligent recommendations (legacy)')
    .addTag('fraude', 'Fraud detection (legacy)')
    .addTag('comportamento', 'Behavior analysis (legacy)')
    .addTag('forecast', 'Advanced sales, inventory & demand forecasting with tfjs')
    .addTag('recommendations', 'Cross-sell, up-sell, replenishment & persona-based recommendations')
    .addTag('nlp', 'NLP: sentiment, intent classification, keywords, product categorization')
    .addTag('anomaly', 'Statistical anomaly detection for pricing, sales & inventory')
    .addTag('pricing', 'Cost-plus, competitive, dynamic, promotional & optimized pricing')
    .addTag('chatbot', 'Rule-based + NLP chatbot for product search, pricing & store info')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3013;
  await app.listen(port);
  logger.info(`AI service running on port ${port}`);
}

bootstrap();
