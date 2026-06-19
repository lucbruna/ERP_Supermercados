import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GatewaysController } from './gateways.controller';
import { GatewaysService } from './gateways.service';
import { GatewayFactory } from './gateway.factory';
import { MercadoPagoGateway } from './mercadopago.gateway';
import { PagSeguroGateway } from './pagseguro.gateway';
import { StoneGateway } from './stone.gateway';
import { CieloGateway } from './cielo.gateway';
import { RedeGateway } from './rede.gateway';
import { GetNetGateway } from './getnet.gateway';
import { PrismaModule } from '../common/prisma.module';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
    }),
    PrismaModule,
  ],
  controllers: [GatewaysController],
  providers: [
    GatewaysService,
    GatewayFactory,
    MercadoPagoGateway,
    PagSeguroGateway,
    StoneGateway,
    CieloGateway,
    RedeGateway,
    GetNetGateway,
  ],
  exports: [GatewaysService, GatewayFactory],
})
export class GatewaysModule {}
