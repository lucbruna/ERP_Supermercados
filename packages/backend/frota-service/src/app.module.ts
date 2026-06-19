import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from '@crm/logging';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma.module';
import { VeiculosModule } from './veiculos/veiculos.module';
import { MotoristasModule } from './motoristas/motoristas.module';
import { AbastecimentosModule } from './abastecimentos/abastecimentos.module';
import { ManutencoesModule } from './manutencoes/manutencoes.module';
import { ContratosVeiculoModule } from './contratos-veiculo/contratos-veiculo.module';
import { MultasModule } from './multas/multas.module';
import { RotasModule } from './rotas/rotas.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    VeiculosModule,
    MotoristasModule,
    AbastecimentosModule,
    ManutencoesModule,
    ContratosVeiculoModule,
    MultasModule,
    RotasModule,
    DashboardModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule {}
