import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { GatewayFactory } from './gateway.factory';
import { PaymentData } from './gateway.interface';
import { GatewayTipo, GatewayTransacaoStatus } from './types';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class GatewaysService {
  private readonly logger = new Logger(GatewaysService.name);
  private readonly maxRetries = 3;

  constructor(
    private readonly factory: GatewayFactory,
    private readonly prisma: PrismaService,
  ) {}

  async processar(tipo: string, data: PaymentData) {
    const gateway = this.factory.getGateway(tipo);
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        this.logger.log(`Payment attempt ${attempt}/${this.maxRetries} on ${tipo}`);

        const result = await gateway.processPayment(data);

        await this.registrarTransacao(tipo, data, result);

        return { success: true, data: result };
      } catch (error) {
        lastError = error as Error;
        this.logger.error(`Attempt ${attempt} failed for ${tipo}: ${(error as Error).message}`);

        if (attempt < this.maxRetries) {
          await this.delay(Math.pow(2, attempt) * 1000);
        }
      }
    }

    throw new BadRequestException(`Pagamento falhou após ${this.maxRetries} tentativas: ${lastError?.message}`);
  }

  async cancelar(tipo: string, transactionId: string) {
    const gateway = this.factory.getGateway(tipo);
    const result = await gateway.cancelPayment(transactionId);

    if (result.success) {
      await (this.prisma as any).gatewayTransacao.updateMany({
        where: { transactionId },
        data: { status: GatewayTransacaoStatus.CANCELADO },
      });
    }

    return { success: result.success, data: result };
  }

  async consultar(tipo: string, transactionId: string) {
    const gateway = this.factory.getGateway(tipo);
    const result = await gateway.consultStatus(transactionId);
    return { success: true, data: result };
  }

  async disponiveis() {
    return { success: true, data: this.factory.listDisponiveis() };
  }

  private async registrarTransacao(tipo: string, data: PaymentData, result: any) {
    const tipoGateway = tipo.toUpperCase().replace('-', '_') as GatewayTipo;

    await (this.prisma as any).gatewayTransacao.create({
      data: {
        gateway: tipoGateway,
        transactionId: result.transactionId,
        type: data.tipoPagamento,
        valor: data.valor,
        parcelas: data.parcelas || 1,
        cartaoBandeira: data.cartaoInfo?.bandeira || null,
        status: result.status || GatewayTransacaoStatus.PENDENTE,
        responseJson: JSON.stringify(result),
      },
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
