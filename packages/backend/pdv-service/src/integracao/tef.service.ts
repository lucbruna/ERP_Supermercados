import { Injectable, Logger } from '@nestjs/common';

interface TefRequest {
  valor: number;
  tipo: 'credito' | 'debito';
  parcelas: number;
  bandeira?: string;
}

interface TefResponse {
  aprovado: boolean;
  codigoAutorizacao: string;
  nsu: string;
  idTransacao: string;
  mensagem: string;
}

@Injectable()
export class TefService {
  private readonly logger = new Logger(TefService.name);

  async processarPagamentoCartao(dados: TefRequest): Promise<TefResponse> {
    this.logger.log(`Processando pagamento TEF: R$ ${dados.valor} ${dados.tipo}`);

    await this.delay(500);

    const nsu = String(Math.floor(Math.random() * 1000000000)).padStart(9, '0');
    const authCode = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
    const idTransacao = `TEF-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    const response: TefResponse = {
      aprovado: true,
      codigoAutorizacao: authCode,
      nsu,
      idTransacao,
      mensagem: 'Transação aprovada',
    };

    this.logger.log(`TEF aprovado: NSU=${nsu}, Auth=${authCode}`);
    return response;
  }

  async cancelarTransacao(idTransacao: string, nsu: string, valor: number): Promise<boolean> {
    this.logger.log(`Cancelando transação TEF: ${idTransacao}`);
    await this.delay(300);
    return true;
  }

  async consultarBandeiras(): Promise<string[]> {
    return ['VISA', 'MASTERCARD', 'ELO', 'AMEX', 'HIPERCARD', 'DINERS'];
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
