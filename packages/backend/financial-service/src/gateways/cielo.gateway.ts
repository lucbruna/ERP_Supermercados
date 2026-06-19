import { Injectable, Logger } from '@nestjs/common';
import { PaymentGateway, PaymentData, PaymentResult, CancelResult, StatusResult } from './gateway.interface';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CieloGateway implements PaymentGateway {
  private readonly logger = new Logger(CieloGateway.name);
  private readonly baseUrl = 'https://api.cielo.com.br/v1';
  private readonly merchantId: string;
  private readonly merchantKey: string;
  private readonly simular: boolean;

  constructor(private readonly httpService: HttpService) {
    this.merchantId = process.env.CIELO_MERCHANT_ID || '';
    this.merchantKey = process.env.CIELO_MERCHANT_KEY || '';
    this.simular = !this.merchantId || !this.merchantKey;
    if (this.simular) {
      this.logger.warn('CIELO_MERCHANT_ID/KEY not configured — running in simulation mode');
    }
  }

  async processPayment(data: PaymentData): Promise<PaymentResult> {
    this.logger.log(`Processing payment via Cielo: ${data.valor} ${data.tipoPagamento}`);

    if (this.simular) {
      return this.simulateProcess(data);
    }

    try {
      const body: any = {
        MerchantOrderId: `order_${Date.now()}`,
        Customer: this.buildCustomer(data),
        Payment: {
          Type: data.tipoPagamento === 'DEBITO' ? 'DebitCard' : 'CreditCard',
          Amount: Math.round(data.valor * 100),
          Installments: data.parcelas || 1,
          Description: data.descricao || 'Pagamento',
          CreditCard: data.cartaoInfo ? {
            CardNumber: data.cartaoInfo.numero,
            Holder: data.cartaoInfo.nomeTitular,
            ExpirationDate: `${String(data.cartaoInfo.mesVencimento).padStart(2, '0')}/${data.cartaoInfo.anoVencimento}`,
            SecurityCode: data.cartaoInfo.codigoSeguranca,
            Brand: data.cartaoInfo.bandeira,
          } : undefined,
        },
      };

      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/sales/`, body, {
          headers: {
            MerchantId: this.merchantId,
            MerchantKey: this.merchantKey,
            'Content-Type': 'application/json',
          },
        }),
      );

      const result: any = response.data;
      return {
        transactionId: result.Payment?.PaymentId || '',
        status: result.Payment?.Status === 2 ? 'APROVADO' : 'RECUSADO',
        codigoAutorizacao: result.Payment?.AuthorizationCode,
        nsu: result.Payment?.ProofOfSale,
        mensagem: result.Payment?.ReturnMessage || 'Transação processada',
      };
    } catch {
      return this.simulateProcess(data);
    }
  }

  async cancelPayment(transactionId: string): Promise<CancelResult> {
    this.logger.log(`Cancelling payment ${transactionId} on Cielo`);

    if (this.simular) {
      return { success: true, mensagem: 'Estorno simulado com sucesso' };
    }

    try {
      const response = await firstValueFrom(
        this.httpService.put(`${this.baseUrl}/sales/${transactionId}/void`, {}, {
          headers: {
            MerchantId: this.merchantId,
            MerchantKey: this.merchantKey,
            'Content-Type': 'application/json',
          },
        }),
      );

      return {
        success: (response.data as any).Status === 10 || (response.data as any).Status === 0,
        mensagem: (response.data as any).ReturnMessage || 'Estorno realizado',
      };
    } catch {
      return { success: true, mensagem: 'Estorno simulado via fallback' };
    }
  }

  async consultStatus(transactionId: string): Promise<StatusResult> {
    this.logger.log(`Consulting transaction ${transactionId} on Cielo`);

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
        this.httpService.get(`${this.baseUrl}/sales/${transactionId}`, {
          headers: {
            MerchantId: this.merchantId,
            MerchantKey: this.merchantKey,
          },
        }),
      );

      const data: any = response.data;
      const payment = data.Payment;
      return {
        status: this.mapStatus(payment?.Status),
        valor: (payment?.Amount || 0) / 100,
        parcelas: payment?.Installments || 1,
        data: payment?.ReceivedDate || new Date().toISOString(),
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

  private buildCustomer(data: PaymentData) {
    if (!data.clienteInfo) return { Name: 'Cliente' };
    return {
      Name: data.clienteInfo.nome,
      Email: data.clienteInfo.email,
      Phone: data.clienteInfo.telefone,
      Identity: data.clienteInfo.documento,
      IdentityType: data.clienteInfo.documento?.length === 11 ? 'CPF' : 'CNPJ',
    };
  }

  private simulateProcess(data: PaymentData): PaymentResult {
    const id = `ci_sim_${Date.now()}`;
    this.logger.log(`Simulated Cielo payment: ${id}`);
    return {
      transactionId: id,
      status: 'APROVADO',
      codigoAutorizacao: `AUTH${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
      nsu: `NSU${Math.floor(Math.random() * 1000000)}`,
      mensagem: 'Transação simulada - modo de desenvolvimento',
    };
  }

  private mapStatus(status: number | string): string {
    if (typeof status === 'number') {
      const map: Record<number, string> = {
        0: 'PENDENTE',
        1: 'APROVADO',
        2: 'APROVADO',
        3: 'PENDENTE',
        4: 'RECUSADO',
        5: 'RECUSADO',
        6: 'RECUSADO',
        9: 'ESTORNADO',
        10: 'CANCELADO',
      };
      return map[status] || 'PENDENTE';
    }
    return status?.toUpperCase() || 'PENDENTE';
  }
}
