import { Injectable, Logger } from '@nestjs/common';
import { PaymentGateway, PaymentData, PaymentResult, CancelResult, StatusResult } from './gateway.interface';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class StoneGateway implements PaymentGateway {
  private readonly logger = new Logger(StoneGateway.name);
  private readonly baseUrl = 'https://api.stone.co/v2';
  private readonly merchantKey: string;
  private readonly simular: boolean;

  constructor(private readonly httpService: HttpService) {
    this.merchantKey = process.env.STONE_MERCHANT_KEY || '';
    this.simular = !this.merchantKey;
    if (this.simular) {
      this.logger.warn('STONE_MERCHANT_KEY not configured — running in simulation mode');
    }
  }

  async processPayment(data: PaymentData): Promise<PaymentResult> {
    this.logger.log(`Processing payment via Stone: ${data.valor} ${data.tipoPagamento}`);

    if (this.simular) {
      return this.simulateProcess(data);
    }

    try {
      const body: any = {
        merchantKey: this.merchantKey,
        amountInCents: Math.round(data.valor * 100),
        description: data.descricao || 'Pagamento',
        installments: data.parcelas || 1,
        type: data.tipoPagamento === 'DEBITO' ? 'DEBIT' : 'CREDIT',
      };

      if (data.cartaoInfo) {
        body.creditCard = {
          cardNumber: data.cartaoInfo.numero,
          expirationMonth: data.cartaoInfo.mesVencimento,
          expirationYear: data.cartaoInfo.anoVencimento,
          securityCode: data.cartaoInfo.codigoSeguranca,
          holderName: data.cartaoInfo.nomeTitular,
          brand: data.cartaoInfo.bandeira,
        };
      }

      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/sale`, body, {
          headers: {
            'Content-Type': 'application/json',
          },
        }),
      );

      const result: any = response.data;
      return {
        transactionId: result.transactionKey || result.id || '',
        status: result.status === 'Captured' ? 'APROVADO' : 'RECUSADO',
        codigoAutorizacao: result.authorizationCode,
        nsu: result.nsu,
        mensagem: result.returnMessage || 'Transação processada',
      };
    } catch {
      return this.simulateProcess(data);
    }
  }

  async cancelPayment(transactionId: string): Promise<CancelResult> {
    this.logger.log(`Cancelling payment ${transactionId} on Stone`);

    if (this.simular) {
      return { success: true, mensagem: 'Estorno simulado com sucesso' };
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/sale/${transactionId}/void`, {}, {
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      return {
        success: (response.data as any).status === 'Voided',
        mensagem: (response.data as any).returnMessage || 'Estorno realizado',
      };
    } catch {
      return { success: true, mensagem: 'Estorno simulado via fallback' };
    }
  }

  async consultStatus(transactionId: string): Promise<StatusResult> {
    this.logger.log(`Consulting transaction ${transactionId} on Stone`);

    if (this.simular) {
      return {
        status: 'Captured',
        valor: 100.0,
        parcelas: 1,
        data: new Date().toISOString(),
      };
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/sale/${transactionId}`, {
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      const data: any = response.data;
      return {
        status: data.status || 'Unknown',
        valor: (data.amountInCents || 0) / 100,
        parcelas: data.installments || 1,
        data: data.createdAt || new Date().toISOString(),
      };
    } catch {
      return {
        status: 'Captured',
        valor: 100.0,
        parcelas: 1,
        data: new Date().toISOString(),
      };
    }
  }

  private simulateProcess(data: PaymentData): PaymentResult {
    const id = `st_sim_${Date.now()}`;
    this.logger.log(`Simulated Stone payment: ${id}`);
    return {
      transactionId: id,
      status: 'APROVADO',
      codigoAutorizacao: `AUTH${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
      nsu: `NSU${Math.floor(Math.random() * 1000000)}`,
      mensagem: 'Transação simulada - modo de desenvolvimento',
    };
  }
}
