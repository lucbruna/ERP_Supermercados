import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { createLogger, CrmLoggerService } from '@crm/logging';

async function bootstrap() {
  const logger = createLogger({ serviceName: 'WorkflowService' });
  const app = await NestFactory.create(AppModule);

  app.useLogger(new CrmLoggerService('WorkflowService'));

  app.use(helmet());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Workflow Service')
    .setDescription('ERP Supermercado - Workflow / Automation Engine')
    .setVersion('1.0')
    .addTag('workflows', 'Workflow definitions')
    .addTag('estados', 'Workflow states')
    .addTag('transicoes', 'Workflow transitions')
    .addTag('instancias', 'Workflow instances')
    .addTag('acoes', 'Action definitions')
    .addTag('tarefas', 'Manual tasks')
    .addTag('automacao', 'Automation rules')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3023;
  await app.listen(port);
  logger.info(`Workflow service running on port ${port}`);
}

bootstrap();
