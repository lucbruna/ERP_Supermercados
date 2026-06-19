import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class AbcCalculatorService {
  private readonly logger = new Logger(AbcCalculatorService.name);

  constructor(private prisma: PrismaService) {}

  async calcular(unidadeId: string, mes: number, ano: number) {
    const dataInicio = new Date(ano, mes - 1, 1);
    const dataFim = new Date(ano, mes, 0, 23, 59, 59);

    const movimentos = await this.prisma.movimentoEstoque.groupBy({
      by: ['produtoId'],
      where: {
        unidadeId,
        tipo: 'SAIDA',
        data: { gte: dataInicio, lte: dataFim },
      },
      _sum: { quantidade: true },
    });

    if (movimentos.length === 0) {
      this.logger.warn(`Nenhum movimento de saída encontrado para ${mes}/${ano}`);
      return [];
    }

    const produtos = await this.prisma.produto.findMany({
      where: {
        id: { in: movimentos.map(m => m.produtoId) },
      },
      select: { id: true, precoVenda: true },
    });

    const precoMap = new Map(produtos.map(p => [p.id, Number(p.precoVenda)]));

    const vendas = movimentos.map(m => {
      const qtd = Number(m._sum.quantidade) || 0;
      const valor = qtd * (precoMap.get(m.produtoId) || 0);
      return { produtoId: m.produtoId, quantidadeVendida: qtd, valorVendido: valor };
    });

    vendas.sort((a, b) => b.valorVendido - a.valorVendido);

    const totalValor = vendas.reduce((sum, v) => sum + v.valorVendido, 0);

    let acumulado = 0;
    const resultados = vendas.map(v => {
      const percentual = totalValor > 0 ? (v.valorVendido / totalValor) * 100 : 0;
      acumulado += percentual;

      let classificacao: string;
      if (acumulado <= 80) classificacao = 'A';
      else if (acumulado <= 95) classificacao = 'B';
      else classificacao = 'C';

      return {
        produtoId: v.produtoId,
        unidadeId,
        mes,
        ano,
        quantidadeVendida: v.quantidadeVendida,
        valorVendido: v.valorVendido,
        percentualFaturamento: parseFloat(percentual.toFixed(4)),
        percentualAcumulado: parseFloat(acumulado.toFixed(4)),
        classificacao,
      };
    });

    return resultados;
  }
}
