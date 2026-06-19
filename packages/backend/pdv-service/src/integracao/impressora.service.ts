import { Injectable, Logger } from '@nestjs/common';

interface ImpressaoCupom {
  cabecalho: string[];
  itens: Array<{
    descricao: string;
    quantidade: number;
    unidade: string;
    precoUnitario: number;
    precoTotal: number;
  }>;
  pagamentos: Array<{
    tipo: string;
    valor: number;
    troco?: number;
  }>;
  rodape: string[];
  total: number;
  desconto?: number;
  acrescimo?: number;
}

@Injectable()
export class ImpressoraService {
  private readonly logger = new Logger(ImpressoraService.name);

  async imprimirCupomNaoFiscal(dados: ImpressaoCupom): Promise<boolean> {
    this.logger.log('Imprimindo cupom não fiscal (simulado)');

    const linhas: string[] = [
      '================================================',
      ...dados.cabecalho,
      '================================================',
      'ITEM  QTD   UN  PREÇO     TOTAL',
      '------------------------------------------------',
    ];

    dados.itens.forEach((item, idx) => {
      linhas.push(
        `${(idx + 1).toString().padEnd(3)} ${item.descricao.slice(0, 20).padEnd(20)}`,
        `      ${String(item.quantidade).padStart(5)} ${item.unidade.padEnd(2)} ${item.precoUnitario.toFixed(2).padStart(7)} ${item.precoTotal.toFixed(2).padStart(9)}`,
      );
    });

    linhas.push('------------------------------------------------');

    if (dados.desconto && dados.desconto > 0) {
      linhas.push(`DESCONTO:               R$ ${dados.desconto.toFixed(2)}`);
    }
    if (dados.acrescimo && dados.acrescimo > 0) {
      linhas.push(`ACRÉSCIMO:              R$ ${dados.acrescimo.toFixed(2)}`);
    }

    linhas.push(`TOTAL:                  R$ ${dados.total.toFixed(2)}`);
    linhas.push('------------------------------------------------');
    linhas.push('FORMAS DE PAGAMENTO:');

    dados.pagamentos.forEach((p) => {
      const linha = `${p.tipo.padEnd(20)} R$ ${p.valor.toFixed(2)}`;
      linhas.push(linha);
      if (p.troco && p.troco > 0) {
        linhas.push(`TROCO:                  R$ ${p.troco.toFixed(2)}`);
      }
    });

    linhas.push('================================================');
    dados.rodape.forEach((r) => linhas.push(r));
    linhas.push('================================================');

    const output = linhas.join('\n');
    this.logger.log(`\n${output}`);
    this.logger.log('Cupom impresso com sucesso (simulado)');

    return true;
  }

  async imprimirRelatorioPDV(dados: {
    pdv: string;
    operador: string;
    dataAbertura: Date;
    dataFechamento: Date;
    vendas: number;
    totalVendas: number;
    sangrias: number;
    totalSangrias: number;
    suprimentos: number;
    totalSuprimentos: number;
    saldoAbertura: number;
    saldoFechamento: number;
  }): Promise<boolean> {
    this.logger.log('Imprimindo relatório de PDV (simulado)');
    await this.delay(500);
    return true;
  }

  async abrirGaveta(): Promise<boolean> {
    this.logger.log('Abrindo gaveta (simulado)');
    await this.delay(200);
    return true;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
