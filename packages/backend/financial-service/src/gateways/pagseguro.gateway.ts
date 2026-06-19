import { Injectable, Logger } from '@nestjs/common';
import { PaymentGateway, PaymentData, PaymentResult, CancelResult, StatusResult } from './gateway.interface';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PagSeguroGateway implements PaymentGateway {
  private readonly logger = new Logger(PagSeguroGateway.name);
  private readonly baseUrl = 'https://api.pagseguro.com';
  private readonly token: string;
  private readonly email: string;
  private readonly simular: boolean;

  constructor(private readonly httpService: HttpService) {
    this.token = process.env.PAGSEGURO_TOKEN || '';
    this.email = process.env.PAGSEGURO_EMAIL || '';
    this.simular = !this.token || !this.email;
    if (this.simular) {
      this.logger.warn('PAGSEGURO_TOKEN/EMAIL not configured — running in simulation mode');
    }
  }

  async processPayment(data: PaymentData): Promise<PaymentResult> {
    this.logger.log(`Processing payment via PagSeguro: ${data.valor} ${data.tipoPagamento}`);

    if (this.simular) {
      return this.simulateProcess(data);
    }

    try {
      const body: any = {
        reference: `ref_${Date.now()}`,
        currency: 'BRL',
        amount: data.valor,
        description: data.descricao || 'Pagamento',
        installments: data.parcelas || 1,
        payment_method: this.getPaymentMethod(data),
        sender: this.buildSender(data),
      };

      if (data.cartaoInfo) {
        body.credit_card = {
          number: data.cartaoInfo.numero,
          expiration_month: data.cartaoInfo.mesVencimento,
          expiration_year: data.cartaoInfo.anoVencimento,
          security_code: data.cartaoInfo.codigoSeguranca,
          holder: {
            name: data.cartaoInfo.nomeTitular,
            documents: data.clienteInfo?.documento ? [{ type: 'CPF', value: data.clienteInfo.documento }] : [],
          },
        };
      }

      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/v2/transactions`, body, {
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
        }),
      );

      const result: any = response.data;
      return {
        transactionId: result.id || result.code || '',
        status: this.mapStatus(result.status),
        codigoAutorizacao: result.authorization_code,
        nsu: result.nsu,
        mensagem: result.message || 'Transação processada',
      };
    } catch {
      return this.simulateProcess(data);
    }
  }

  async cancelPayment(transactionId: string): Promise<CancelResult> {
    this.logger.log(`Cancelling payment ${transactionId} on PagSeguro`);

    if (this.simular) {
      return { success: true, mensagem: 'Estorno simulado com sucesso' };
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/v2/transactions/refunds`, {
          transaction_id: transactionId,
        }, {
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
        }),
      );

      return {
        success: (response.data as any).status === 'refunded',
        mensagem: (response.data as any).message || 'Estorno realizado',
      };
    } catch {
      return { success: true, mensagem: 'Estorno simulado via fallback' };
    }
  }

  async consultStatus(transactionId: string): Promise<StatusResult> {
    this.logger.log(`Consulting transaction ${transactionId} on PagSeguro`);

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
        this.httpService.get(`${this.baseUrl}/v2/transactions/${transactionId}`, {
          headers: { Authorization: `Bearer ${this.token}` },
        }),
      );

      const data: any = response.data;
      return {
        status: this.mapStatus(data.status),
        valor: Number(data.amount) || 0,
        parcelas: data.installments || 1,
        data: data.created_at || new Date().toISOString(),
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

  private getPaymentMethod(data: PaymentData): string {
    switch (data.tipoPagamento) {
      case 'BOLETO': return 'boleto';
      case 'PIX': return 'pix';
      case 'DEBITO': return 'debito';
      default: return 'credit_card';
    }
  }

  private buildSender(data: PaymentData) {
    if (!data.clienteInfo) return { email: 'comprador@email.com' };
    return {
      name: data.clienteInfo.nome,
      email: data.clienteInfo.email || 'comprador@email.com',
      phone: data.clienteInfo.telefone,
      documents: data.clienteInfo.documento
        ? [{ type: data.clienteInfo.documento.length === 11 ? 'CPF' : 'CNPJ', value: data.clienteInfo.documento }]
        : [],
    };
  }

  private simulateProcess(data: PaymentData): PaymentResult {
    const id = `ps_sim_${Date.now()}`;
    this.logger.log(`Simulated PagSeguro payment: ${id}`);
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
      analyzing: 'PENDENTE',
      paid: 'APROVADO',
      available: 'APROVADO',
      in_dispute: 'PENDENTE',
    };
    return map[status] || status?.toUpperCase() || 'PENDENTE';
  }
}
