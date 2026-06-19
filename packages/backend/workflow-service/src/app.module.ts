import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from '@crm/logging';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma.module';
import { WorkflowsModule } from './workflows/workflows.module';
import { EstadosModule } from './estados/estados.module';
import { TransicoesModule } from './transicoes/transicoes.module';
import { InstanciasModule } from './instancias/instancias.module';
import { AcoesModule } from './acoes/acoes.module';
import { TarefasModule } from './tarefas/tarefas.module';
import { AutomacaoModule } from './automacao/automacao.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    WorkflowsModule,
    EstadosModule,
    TransicoesModule,
    InstanciasModule,
    AcoesModule,
    TarefasModule,
    AutomacaoModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule {}
