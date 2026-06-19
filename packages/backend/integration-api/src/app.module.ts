import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from '@crm/logging';
import { PrismaModule } from './common/prisma.module';
import { EcommerceModule } from './ecommerce/ecommerce.module';
import { BalancaModule } from './balanca/balanca.module';
import { ColetorModule } from './coletor/coletor.module';
import { CorreiosModule } from './correios/correios.module';

@Module({
  imports: [PrismaModule, EcommerceModule, BalancaModule, ColetorModule, CorreiosModule],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule {}
