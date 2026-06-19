import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from '@crm/logging';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma.module';
import { CampanhasModule } from './campanhas/campanhas.module';
import { DestinatariosModule } from './destinatarios/destinatarios.module';
import { ModelosModule } from './modelos/modelos.module';
import { AutomacoesModule } from './automacoes/automacoes.module';
import { PromocoesModule } from './promocoes/promocoes.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    CampanhasModule,
    DestinatariosModule,
    ModelosModule,
    AutomacoesModule,
    PromocoesModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule {}
