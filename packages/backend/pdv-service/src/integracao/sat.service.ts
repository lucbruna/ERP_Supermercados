import { Injectable, Logger } from '@nestjs/common';

interface SatRequest {
  chaveAcesso: string;
  valor: number;
  itens: any[];
  pagamentos: any[];
  cnpj: string;
  cpfConsumidor?: string;
}

interface SatResponse {
  numeroSessao: string;
  codigo: string;
  qrCode: string;
  xmlSat: string;
  chaveAcesso: string;
  protocolo: string;
}

@Injectable()
export class SatService {
  private readonly logger = new Logger(SatService.name);

  async emitirSat(dados: SatRequest): Promise<SatResponse> {
    this.logger.log(`Emitindo SAT: valor=R$ ${dados.valor}, chave=${dados.chaveAcesso}`);

    await this.delay(1000);

    const numeroSessao = String(Math.floor(Math.random() * 999999) + 1).padStart(6, '0');
    const chaveAcesso = dados.chaveAcesso || `${Date.now()}${Math.random().toString(36).slice(2, 10).toUpperCase()}`;

    const response: SatResponse = {
      numeroSessao,
      codigo: '0600',
      qrCode: `https://www.sefaz.gov.br/qrcode/${chaveAcesso}`,
      xmlSat: `<?xml version="1.0" encoding="UTF-8"?><SAT><infCFe chave="${chaveAcesso}" /><total vCFe="${dados.valor.toFixed(2)}" /></SAT>`,
      chaveAcesso,
      protocolo: `P${numeroSessao}${Date.now()}`,
    };

    this.logger.log(`SAT emitido: sessão=${numeroSessao}`);
    return response;
  }

  async cancelarSat(numeroSessao: string, chaveAcesso: string): Promise<boolean> {
    this.logger.log(`Cancelando SAT: sessão=${numeroSessao}`);
    await this.delay(500);
    return true;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
