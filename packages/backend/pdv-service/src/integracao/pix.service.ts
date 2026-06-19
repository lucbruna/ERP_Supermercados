import { Injectable, Logger } from '@nestjs/common';
import * as qrcode from 'qrcode';

interface PixConfig {
  chavePix: string;
  nomeBeneficiario: string;
  cidade: string;
  cep?: string;
  txId?: string;
}

interface PixGenerateResult {
  copiaECola: string;
  qrCodeBase64: string;
  txId: string;
  valor: number;
  expiracao: Date;
}

@Injectable()
export class PixService {
  private readonly logger = new Logger(PixService.name);
  private readonly config: PixConfig = {
    chavePix: process.env.PIX_KEY || 'contato@supermercado.com.br',
    nomeBeneficiario: process.env.PIX_MERCHANT_NAME || 'Supermercado Ltda',
    cidade: process.env.PIX_MERCHANT_CITY || 'BRASILIA',
    cep: process.env.PIX_MERCHANT_CEP || '70000000',
  };

  async generateQrCode(valor: number, txId?: string): Promise<PixGenerateResult> {
    const transactionId = txId || `PDV${Date.now()}${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const expiracao = new Date(Date.now() + 15 * 60 * 1000);

    const copiaECola = this.buildPixPayload({
      chave: this.config.chavePix,
      valor,
      txId: transactionId,
      nome: this.config.nomeBeneficiario,
      cidade: this.config.cidade,
    });

    let qrCodeBase64 = '';
    try {
      qrCodeBase64 = await qrcode.toDataURL(copiaECola, { width: 300, margin: 2 });
    } catch (error: any) {
      this.logger.error(`Erro ao gerar QR Code: ${error.message}`);
    }

    this.logger.log(`PIX QR Code gerado: valor=R$${valor}, txId=${transactionId}`);
    return { copiaECola, qrCodeBase64, txId: transactionId, valor, expiracao };
  }

  async consultarStatus(txId: string): Promise<{ status: string; pago: boolean; dataPagamento?: Date }> {
    this.logger.log(`Consultando status PIX: txId=${txId}`);

    const pago = Math.random() > 0.3;
    if (pago) {
      return { status: 'CONCLUIDA', pago: true, dataPagamento: new Date() };
    }
    return { status: 'PENDENTE', pago: false };
  }

  async simularConfirmacao(txId: string): Promise<boolean> {
    this.logger.log(`Simulando confirmação PIX: txId=${txId}`);
    await this.delay(2000);
    return true;
  }

  async estornarPix(txId: string, valor: number): Promise<boolean> {
    this.logger.log(`Estornando PIX: txId=${txId}, valor=R$${valor}`);
    await this.delay(1000);
    return true;
  }

  private buildPixPayload(params: { chave: string; valor: number; txId: string; nome: string; cidade: string }): string {
    const valorStr = params.valor.toFixed(2);

    const payloadMap = new Map<string, string>();

    payloadMap.set('00', '01');

    const merchantAccountInfo = `0014BR.GOV.BCB.PIX0136${params.chave}`;
    payloadMap.set('26', this.formatMerchantAccount(merchantAccountInfo));

    payloadMap.set('52', '0000');
    payloadMap.set('53', '986');

    const valorFormatted = valorStr.replace('.', '').padStart(10, '0');
    payloadMap.set('54', valorFormatted);

    payloadMap.set('58', 'BR');
    payloadMap.set('59', params.nome.length.toString().padStart(2, '0') + params.nome);
    payloadMap.set('60', params.cidade.length.toString().padStart(2, '0') + params.cidade);

    const txIdFormatted = params.txId;
    payloadMap.set('62', `05${txIdFormatted.length.toString().padStart(2, '0')}${txIdFormatted}`);

    let payload = '';
    for (const [id, value] of payloadMap) {
      payload += id + value;
    }

    const crc16 = this.calculateCRC16(payload + '6304');
    return payload + '6304' + crc16.toUpperCase();
  }

  private formatMerchantAccount(content: string): string {
    const len = content.length.toString().padStart(2, '0');
    return len + content;
  }

  private calculateCRC16(data: string): string {
    let crc = 0xFFFF;
    const polynomial = 0x1021;

    for (let i = 0; i < data.length; i++) {
      crc ^= data.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        if (crc & 0x8000) {
          crc = (crc << 1) ^ polynomial;
        } else {
          crc = crc << 1;
        }
        crc &= 0xFFFF;
      }
    }

    return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
