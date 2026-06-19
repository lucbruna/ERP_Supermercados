import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from '@crm/logging';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma.module';
import { FuncionarioModule } from './funcionario/funcionario.module';
import { PontoModule } from './ponto/ponto.module';
import { FolhaModule } from './folha/folha.module';
import { FeriasModule } from './ferias/ferias.module';
import { RecrutamentoModule } from './recrutamento/recrutamento.module';
import { TreinamentoModule } from './treinamento/treinamento.module';
import { BeneficioModule } from './beneficio/beneficio.module';
import { BancoHorasModule } from './banco-horas/banco-horas.module';
import { BiometriaModule } from './biometria/biometria.module';
import { EsocialModule } from './esocial/esocial.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    FuncionarioModule,
    PontoModule,
    FolhaModule,
    FeriasModule,
    RecrutamentoModule,
    TreinamentoModule,
    BeneficioModule,
    BancoHorasModule,
    BiometriaModule,
    EsocialModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule {}
