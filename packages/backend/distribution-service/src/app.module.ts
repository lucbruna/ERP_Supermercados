import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from '@crm/logging';
import { PrismaModule } from './common/prisma.module';
import { SeparacaoModule } from './separacao/separacao.module';
import { RoteirizacaoModule } from './roteirizacao/roteirizacao.module';
import { VeiculosModule } from './veiculos/veiculos.module';
import { MotoristasModule } from './motoristas/motoristas.module';
import { ExpedicaoModule } from './expedicao/expedicao.module';

@Module({
  imports: [
    PrismaModule,
    SeparacaoModule,
    RoteirizacaoModule,
    VeiculosModule,
    MotoristasModule,
    ExpedicaoModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule {}
