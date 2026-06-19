import { Injectable, Logger } from '@nestjs/common';
import { PaymentGateway } from './gateway.interface';
import { MercadoPagoGateway } from './mercadopago.gateway';
import { PagSeguroGateway } from './pagseguro.gateway';
import { StoneGateway } from './stone.gateway';
import { CieloGateway } from './cielo.gateway';
import { RedeGateway } from './rede.gateway';
import { GetNetGateway } from './getnet.gateway';
import { GatewayTipo, GatewayConfig } from './types';

@Injectable()
export class GatewayFactory {
  private readonly logger = new Logger(GatewayFactory.name);

  constructor(
    private readonly mercadopago: MercadoPagoGateway,
    private readonly pagseguro: PagSeguroGateway,
    private readonly stone: StoneGateway,
    private readonly cielo: CieloGateway,
    private readonly rede: RedeGateway,
    private readonly getnet: GetNetGateway,
  ) {}

  getGateway(tipo: string): PaymentGateway {
    const key = tipo.toUpperCase().replace('-', '_');
    switch (key) {
      case GatewayTipo.MERCADO_PAGO:
        return this.mercadopago;
      case GatewayTipo.PAGSEGURO:
        return this.pagseguro;
      case GatewayTipo.STONE:
        return this.stone;
      case GatewayTipo.CIELO:
        return this.cielo;
      case GatewayTipo.REDE:
        return this.rede;
      case GatewayTipo.GETNET:
        return this.getnet;
      default:
        throw new Error(`Gateway não suportado: ${tipo}`);
    }
  }

  listDisponiveis(): GatewayConfig[] {
    return [
      { tipo: GatewayTipo.MERCADO_PAGO, nome: 'Mercado Pago', configured: !!process.env.MERCADO_PAGO_ACCESS_TOKEN },
      { tipo: GatewayTipo.PAGSEGURO, nome: 'PagSeguro', configured: !!process.env.PAGSEGURO_TOKEN && !!process.env.PAGSEGURO_EMAIL },
      { tipo: GatewayTipo.STONE, nome: 'Stone', configured: !!process.env.STONE_MERCHANT_KEY },
      { tipo: GatewayTipo.CIELO, nome: 'Cielo', configured: !!process.env.CIELO_MERCHANT_ID && !!process.env.CIELO_MERCHANT_KEY },
      { tipo: GatewayTipo.REDE, nome: 'Rede', configured: !!process.env.REDE_TOKEN },
      { tipo: GatewayTipo.GETNET, nome: 'GetNet', configured: !!process.env.GETNET_CLIENT_ID && !!process.env.GETNET_CLIENT_SECRET },
    ];
  }
}
