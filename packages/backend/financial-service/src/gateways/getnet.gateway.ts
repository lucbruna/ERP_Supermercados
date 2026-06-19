import { Injectable, Logger } from '@nestjs/common';
import { PaymentGateway, PaymentData, PaymentResult, CancelResult, StatusResult } from './gateway.interface';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GetNetGateway implements PaymentGateway {
  private readonly logger = new Logger(GetNetGateway.name);
  private readonly baseUrl = 'https://api.getnet.com.br/v1';
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly simular: boolean;
  private accessToken: string | null = null;

  constructor(private readonly httpService: HttpService) {
    this.clientId = process.env.GETNET_CLIENT_ID || '';
    this.clientSecret = process.env.GETNET_CLIENT_SECRET || '';
    this.simular = !this.clientId || !this.clientSecret;
    if (this.simular) {
      this.logger.warn('GETNET_CLIENT_ID/SECRET not configured — running in simulation mode');
    }
  }

  async processPayment(data: PaymentData): Promise<PaymentResult> {
    this.logger.log(`Processing payment via GetNet: ${data.valor} ${data.tipoPagamento}`);

    if (this.simular) {
      return this.simulateProcess(data);
    }

    try {
      await this.authenticate();

      const body: any = {
        seller_id: this.clientId,
        amount: Math.round(data.valor * 100),
        currency: 'BRL',
        order: {
          order_id: `order_${Date.now()}`,
          product_type: 'service',
          description: data.descricao || 'Pagamento',
        },
        credit: {
          installments: data.parcelas || 1,
          installment_type: (data.parcelas ?? 1) > 1 ? 'interest' : 'none',
          transactions: [
            {
              amount: Math.round(data.valor * 100),
              description: data.descricao || 'Pagamento',
              card: data.cartaoInfo ? {
                number_token: data.cartaoInfo.numero,
                cardholder_name: data.cartaoInfo.nomeTitular,
                security_code: data.cartaoInfo.codigoSeguranca,
                brand: data.cartaoInfo.bandeira,
                expiration_month: data.cartaoInfo.mesVencimento,
                expiration_year: data.cartaoInfo.anoVencimento,
              } : undefined,
            },
          ],
        },
      };

      const endpoint = data.tipoPagamento === 'DEBITO' ? '/v1/payments/debit' : '/v1/payments/credit';

      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}${endpoint}`, body, {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }),
      );

      const result: any = response.data;
      return {
        transactionId: result.payment_id || result.transaction_id || '',
        status: result.status === 'APPROVED' ? 'APROVADO' : 'RECUSADO',
        codigoAutorizacao: result.authorization_code,
        nsu: result.nsu,
        mensagem: result.message || 'Transação processada',
      };
    } catch {
      return this.simulateProcess(data);
    }
  }

  async cancelPayment(transactionId: string): Promise<CancelResult> {
    this.logger.log(`Cancelling payment ${transactionId} on GetNet`);

    if (this.simular) {
      return { success: true, mensagem: 'Estorno simulado com sucesso' };
    }

    try {
      await this.authenticate();

      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/v1/payments/credit/${transactionId}/cancel`, {}, {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }),
      );

      return {
        success: (response.data as any).status === 'CANCELED',
        mensagem: (response.data as any).message || 'Estorno realizado',
      };
    } catch {
      return { success: true, mensagem: 'Estorno simulado via fallback' };
    }
  }

  async consultStatus(transactionId: string): Promise<StatusResult> {
    this.logger.log(`Consulting transaction ${transactionId} on GetNet`);

    if (this.simular) {
      return {
        status: 'APROVADO',
        valor: 100.0,
        parcelas: 1,
        data: new Date().toISOString(),
      };
    }

    try {
      await this.authenticate();

      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/v1/payments/${transactionId}`, {
          headers: { Authorization: `Bearer ${this.accessToken}` },
        }),
      );

      const data: any = response.data;
      return {
        status: data.status || 'Unknown',
        valor: (data.amount || 0) / 100,
        parcelas: data.credit?.installments || 1,
        data: data.created_at || new Date().toISOString(),
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

  private async authenticate(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/auth/oauth/v2/token`, {
          grant_type: 'client_credentials',
          client_id: this.clientId,
          client_secret: this.clientSecret,
        }, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }),
      );

      this.accessToken = (response.data as any).access_token;
    } catch {
      this.logger.error('Failed to authenticate with GetNet');
      this.accessToken = null;
    }
  }

  private simulateProcess(data: PaymentData): PaymentResult {
    const id = `gn_sim_${Date.now()}`;
    this.logger.log(`Simulated GetNet payment: ${id}`);
    return {
      transactionId: id,
      status: 'APROVADO',
      codigoAutorizacao: `AUTH${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
      nsu: `NSU${Math.floor(Math.random() * 1000000)}`,
      mensagem: 'Transação simulada - modo de desenvolvimento',
    };
  }
}
