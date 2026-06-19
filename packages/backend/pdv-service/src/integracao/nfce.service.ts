import { Injectable, Logger } from '@nestjs/common';

interface NfceRequest {
  chaveAcesso: string;
  numero: number;
  serie: number;
  dataEmissao: Date;
  cnpjEmitente: string;
  nomeEmitente: string;
  cpfConsumidor?: string;
  nomeConsumidor?: string;
  itens: any[];
  pagamentos: any[];
  subtotal: number;
  desconto: number;
  total: number;
}

interface NfceResponse {
  chaveAcesso: string;
  numero: number;
  serie: number;
  protocolo: string;
  xmlNfce: string;
  urlDanfe: string;
  status: string;
}

@Injectable()
export class NfceService {
  private readonly logger = new Logger(NfceService.name);

  async emitirNfce(dados: NfceRequest): Promise<NfceResponse> {
    this.logger.log(`Emitindo NFC-e: nº ${dados.numero}, total=R$ ${dados.total}`);

    await this.delay(800);

    const chaveAcesso = dados.chaveAcesso || `${dados.cnpjEmitente.replace(/\D/g, '')}${String(dados.numero).padStart(9, '0')}${Date.now()}`;
    const protocolo = `${dados.cnpjEmitente.replace(/\D/g, '')}${String(Math.floor(Math.random() * 999999999)).padStart(9, '0')}`;

    const response: NfceResponse = {
      chaveAcesso,
      numero: dados.numero,
      serie: dados.serie || 1,
      protocolo,
      xmlNfce: `<?xml version="1.0" encoding="UTF-8"?><NFCe><infNFe chave="${chaveAcesso}" /><total vNF="${dados.total.toFixed(2)}" /></NFCe>`,
      urlDanfe: `https://www.sefaz.gov.br/nfce/${chaveAcesso}`,
      status: 'AUTORIZADA',
    };

    this.logger.log(`NFC-e emitida: chave=${chaveAcesso}`);
    return response;
  }

  async cancelarNfce(chaveAcesso: string, motivo: string): Promise<boolean> {
    this.logger.log(`Cancelando NFC-e: chave=${chaveAcesso}, motivo=${motivo}`);
    await this.delay(500);
    return true;
  }

  async consultarNfce(chaveAcesso: string): Promise<any> {
    return {
      chaveAcesso,
      status: 'AUTORIZADA',
      data: new Date(),
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
