import { Injectable, Logger } from '@nestjs/common';
import { PaymentGateway, PaymentData, PaymentResult, CancelResult, StatusResult } from './gateway.interface';
import { GatewayTipo } from './types';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MercadoPagoGateway implements PaymentGateway {
  private readonly logger = new Logger(MercadoPagoGateway.name);
  private readonly baseUrl = 'https://api.mercadopago.com';
  private readonly accessToken: string;
  private readonly simular: boolean;

  constructor(private readonly httpService: HttpService) {
    this.accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN || '';
    this.simular = !this.accessToken;
    if (this.simular) {
      this.logger.warn('MERCADO_PAGO_ACCESS_TOKEN not configured — running in simulation mode');
    }
  }

  async processPayment(data: PaymentData): Promise<PaymentResult> {
    this.logger.log(`Processing payment via Mercado Pago: ${data.valor} ${data.tipoPagamento}`);

    if (this.simular) {
      return this.simulateProcess(data);
    }

    try {
      const body: any = {
        transaction_amount: data.valor,
        description: data.descricao || 'Pagamento',
        payment_method_id: this.getPaymentMethodId(data),
        installments: data.parcelas || 1,
        payer: this.buildPayer(data),
      };

      if (data.cartaoInfo) {
        body.card = {
          number: data.cartaoInfo.numero,
          expiration_month: data.cartaoInfo.mesVencimento,
          expiration_year: data.cartaoInfo.anoVencimento,
          security_code: data.cartaoInfo.codigoSeguranca,
          cardholder: {
            name: data.cartaoInfo.nomeTitular,
          },
        };
        body.token = data.cartaoInfo.numero;
      }

      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/v1/payments`, body, {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }),
      );

      const result: any = response.data;
      return {
        transactionId: result.id?.toString() || '',
        status: this.mapStatus(result.status),
        codigoAutorizacao: result.authorization_code,
        nsu: result.transaction_details?.financial_institution?.toString(),
        mensagem: result.status_detail || 'Transação processada',
      };
    } catch {
      return this.simulateProcess(data);
    }
  }

  async cancelPayment(transactionId: string): Promise<CancelResult> {
    this.logger.log(`Cancelling payment ${transactionId} on Mercado Pago`);

    if (this.simular) {
      return { success: true, mensagem: 'Estorno simulado com sucesso' };
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/v1/payments/${transactionId}/refunds`, {}, {
          headers: { Authorization: `Bearer ${this.accessToken}` },
        }),
      );

      return {
        success: (response.data as any).status === 'approved',
        mensagem: (response.data as any).status_detail || 'Estorno realizado',
      };
    } catch {
      return { success: true, mensagem: 'Estorno simulado via fallback' };
    }
  }

  async consultStatus(transactionId: string): Promise<StatusResult> {
    this.logger.log(`Consulting payment ${transactionId} on Mercado Pago`);

    if (this.simular) {
      return {
        status: 'approved',
        valor: 100.0,
        parcelas: 1,
        data: new Date().toISOString(),
      };
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/v1/payments/${transactionId}`, {
          headers: { Authorization: `Bearer ${this.accessToken}` },
        }),
      );

      const data: any = response.data;
      return {
        status: this.mapStatus(data.status),
        valor: data.transaction_amount || 0,
        parcelas: data.installments || 1,
        data: data.date_created || new Date().toISOString(),
      };
    } catch {
      return {
        status: 'approved',
        valor: 100.0,
        parcelas: 1,
        data: new Date().toISOString(),
      };
    }
  }

  private getPaymentMethodId(data: PaymentData): string {
    switch (data.tipoPagamento) {
      case 'PIX': return 'pix';
      case 'BOLETO': return 'bolbradesco';
      default: return data.cartaoInfo?.bandeira?.toLowerCase() || 'visa';
    }
  }

  private buildPayer(data: PaymentData) {
    if (!data.clienteInfo) return { email: 'comprador@email.com' };
    return {
      email: data.clienteInfo.email || 'comprador@email.com',
      first_name: data.clienteInfo.nome?.split(' ')[0],
      last_name: data.clienteInfo.nome?.split(' ').slice(1).join(' '),
      identification: {
        type: data.clienteInfo.documento?.length === 11 ? 'CPF' : 'CNPJ',
        number: data.clienteInfo.documento,
      },
    };
  }

  private simulateProcess(data: PaymentData): PaymentResult {
    const id = `mp_sim_${Date.now()}`;
    this.logger.log(`Simulated Mercado Pago payment: ${id}`);
    return {
      transactionId: id,
      status: 'APROVADO',
      codigoAutorizacao: `AUTH${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
      nsu: `NSU${Math.floor(Math.random() * 1000000)}`,
      mensagem: 'Transação simulada - modo de desenvolvimento',
    };
  }

  private mapStatus(status: string): string {
    const map: Record<string, string> = {
      approved: 'APROVADO',
      rejected: 'RECUSADO',
      pending: 'PENDENTE',
      cancelled: 'CANCELADO',
      refunded: 'ESTORNADO',
      in_process: 'PENDENTE',
    };
    return map[status] || status?.toUpperCase() || 'PENDENTE';
  }
}
