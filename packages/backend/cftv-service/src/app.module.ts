import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from '@crm/logging';
import { PrismaModule } from './common/prisma.module';
import { ServicesModule } from './services/services.module';
import { CamerasModule } from './cameras/cameras.module';
import { EventosModule } from './eventos/eventos.module';
import { GravacoesModule } from './gravacoes/gravacoes.module';
import { ReconhecimentoFacialModule } from './reconhecimento-facial/reconhecimento-facial.module';
import { LeituraPlacasModule } from './leitura-placas/leitura-placas.module';
import { AlertasModule } from './alertas/alertas.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 20 }]),
    PrismaModule,
    ServicesModule,
    CamerasModule,
    EventosModule,
    GravacoesModule,
    ReconhecimentoFacialModule,
    LeituraPlacasModule,
    AlertasModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule {}
