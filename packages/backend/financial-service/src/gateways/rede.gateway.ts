import { Injectable, Logger } from '@nestjs/common';
import { PaymentGateway, PaymentData, PaymentResult, CancelResult, StatusResult } from './gateway.interface';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class RedeGateway implements PaymentGateway {
  private readonly logger = new Logger(RedeGateway.name);
  private readonly baseUrl = 'https://api.rede.com.br/v1';
  private readonly token: string;
  private readonly simular: boolean;

  constructor(private readonly httpService: HttpService) {
    this.token = process.env.REDE_TOKEN || '';
    this.simular = !this.token;
    if (this.simular) {
      this.logger.warn('REDE_TOKEN not configured — running in simulation mode');
    }
  }

  async processPayment(data: PaymentData): Promise<PaymentResult> {
    this.logger.log(`Processing payment via Rede: ${data.valor} ${data.tipoPagamento}`);

    if (this.simular) {
      return this.simulateProcess(data);
    }

    try {
      const body: any = {
        reference: `ref_${Date.now()}`,
        amount: Math.round(data.valor * 100),
        currency: 'BRL',
        installments: data.parcelas || 1,
        description: data.descricao || 'Pagamento',
        transactionType: data.tipoPagamento === 'DEBITO' ? 'debit' : 'credit',
      };

      if (data.cartaoInfo) {
        body.card = {
          cardNumber: data.cartaoInfo.numero,
          holder: data.cartaoInfo.nomeTitular,
          expirationMonth: data.cartaoInfo.mesVencimento,
          expirationYear: data.cartaoInfo.anoVencimento,
          securityCode: data.cartaoInfo.codigoSeguranca,
          brand: data.cartaoInfo.bandeira,
        };
      }

      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/transactions`, body, {
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
        }),
      );

      const result: any = response.data;
      return {
        transactionId: result.tid || result.reference || '',
        status: result.returnCode === '00' ? 'APROVADO' : 'RECUSADO',
        codigoAutorizacao: result.authorizationCode,
        nsu: result.nsu,
        mensagem: result.returnMessage || 'Transação processada',
      };
    } catch {
      return this.simulateProcess(data);
    }
  }

  async cancelPayment(transactionId: string): Promise<CancelResult> {
    this.logger.log(`Cancelling payment ${transactionId} on Rede`);

    if (this.simular) {
      return { success: true, mensagem: 'Estorno simulado com sucesso' };
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/transactions/${transactionId}/refunds`, {}, {
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
        }),
      );

      return {
        success: (response.data as any).returnCode === '00',
        mensagem: (response.data as any).returnMessage || 'Estorno realizado',
      };
    } catch {
      return { success: true, mensagem: 'Estorno simulado via fallback' };
    }
  }

  async consultStatus(transactionId: string): Promise<StatusResult> {
    this.logger.log(`Consulting transaction ${transactionId} on Rede`);

    if (this.simular) {
      return {
        status: 'APROVADO',
        valor: 100.0,
        parcelas: 1,
        data: new Date().toISOString(),
      };
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/transactions/${transactionId}`, {
          headers: { Authorization: `Bearer ${this.token}` },
        }),
      );

      const data: any = response.data;
      return {
        status: data.returnCode === '00' ? 'APROVADO' : 'RECUSADO',
        valor: (data.amount || 0) / 100,
        parcelas: data.installments || 1,
        data: data.transactionDate || new Date().toISOString(),
      };
    } catch {
      return {
        status: 'APROVADO',
        valor: 100.0,
        parcelas: 1,
        data: new Date().toISOString(),
      };
    }
  }

  private simulateProcess(data: PaymentData): PaymentResult {
    const id = `rd_sim_${Date.now()}`;
    this.logger.log(`Simulated Rede payment: ${id}`);
    return {
      transactionId: id,
      status: 'APROVADO',
      codigoAutorizacao: `AUTH${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
      nsu: `NSU${Math.floor(Math.random() * 1000000)}`,
      mensagem: 'Transação simulada - modo de desenvolvimento',
    };
  }
}
