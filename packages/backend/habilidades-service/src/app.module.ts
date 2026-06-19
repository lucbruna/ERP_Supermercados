import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from '@crm/logging';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma.module';
import { HabilidadesModule } from './habilidades/habilidades.module';
import { CertificacoesModule } from './certificacoes/certificacoes.module';
import { TreinamentosModule } from './treinamentos/treinamentos.module';
import { AvaliacoesModule } from './avaliacoes/avaliacoes.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    HabilidadesModule,
    CertificacoesModule,
    TreinamentosModule,
    AvaliacoesModule,
    DashboardModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule {}
