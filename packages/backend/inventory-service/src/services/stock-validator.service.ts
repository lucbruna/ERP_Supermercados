import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

interface AlertaEstoque {
  produtoId: string;
  codigo: string;
  descricao: string;
  unidadeMedida: string;
  estoqueAtual: number;
  estoqueMinimo: number;
  estoqueMaximo: number;
  consumoMedio: number;
  tipo: 'ESTOQUE_CRITICO' | 'ESTOQUE_BAIXO' | 'ESTOQUE_EXCEDENTE' | 'SEM_MOVIMENTO';
  mensagem: string;
}

@Injectable()
export class StockValidatorService {
  private readonly logger = new Logger(StockValidatorService.name);

  constructor(private prisma: PrismaService) {}

  async gerarAlertasEstoque(unidadeId: string): Promise<AlertaEstoque[]> {
    const produtos = await this.prisma.produto.findMany({
      where: { unidadeId, ativo: true },
      select: {
        id: true,
        codigo: true,
        descricao: true,
        unidadeMedida: true,
        estoqueAtual: true,
        estoqueMinimo: true,
        estoqueMaximo: true,
        estoqueReservado: true,
      },
    });

    const tresMesesAtras = new Date();
    tresMesesAtras.setMonth(tresMesesAtras.getMonth() - 3);

    const alertas: AlertaEstoque[] = [];

    for (const produto of produtos) {
      const estoqueAtual = Number(produto.estoqueAtual);
      const estoqueMinimo = Number(produto.estoqueMinimo);
      const estoqueMaximo = Number(produto.estoqueMaximo);

      const movimentos = await this.prisma.movimentoEstoque.aggregate({
        where: {
          produtoId: produto.id,
          unidadeId,
          tipo: 'SAIDA',
          data: { gte: tresMesesAtras },
        },
        _sum: { quantidade: true },
      });

      const totalVendas = Number(movimentos._sum.quantidade) || 0;
      const consumoMedio = totalVendas / 90;

      if (estoqueAtual <= 0) {
        alertas.push({
          produtoId: produto.id,
          codigo: produto.codigo,
          descricao: produto.descricao,
          unidadeMedida: produto.unidadeMedida,
          estoqueAtual,
          estoqueMinimo,
          estoqueMaximo,
          consumoMedio: parseFloat(consumoMedio.toFixed(3)),
          tipo: 'ESTOQUE_CRITICO',
          mensagem: `Estoque crítico: ${estoqueAtual} unidades`,
        });
      } else if (estoqueAtual <= estoqueMinimo) {
        alertas.push({
          produtoId: produto.id,
          codigo: produto.codigo,
          descricao: produto.descricao,
          unidadeMedida: produto.unidadeMedida,
          estoqueAtual,
          estoqueMinimo,
          estoqueMaximo,
          consumoMedio: parseFloat(consumoMedio.toFixed(3)),
          tipo: 'ESTOQUE_BAIXO',
          mensagem: `Estoque abaixo do mínimo: ${estoqueAtual}/${estoqueMinimo}`,
        });
      } else if (estoqueAtual > estoqueMaximo) {
        alertas.push({
          produtoId: produto.id,
          codigo: produto.codigo,
          descricao: produto.descricao,
          unidadeMedida: produto.unidadeMedida,
          estoqueAtual,
          estoqueMinimo,
          estoqueMaximo,
          consumoMedio: parseFloat(consumoMedio.toFixed(3)),
          tipo: 'ESTOQUE_EXCEDENTE',
          mensagem: `Estoque excedente: ${estoqueAtual}/${estoqueMaximo}`,
        });
      }

      if (totalVendas === 0 && estoqueAtual > 0) {
        alertas.push({
          produtoId: produto.id,
          codigo: produto.codigo,
          descricao: produto.descricao,
          unidadeMedida: produto.unidadeMedida,
          estoqueAtual,
          estoqueMinimo,
          estoqueMaximo,
          consumoMedio: 0,
          tipo: 'SEM_MOVIMENTO',
          mensagem: `Sem movimentação nos últimos 3 meses (estoque: ${estoqueAtual})`,
        });
      }
    }

    return alertas;
  }
}
