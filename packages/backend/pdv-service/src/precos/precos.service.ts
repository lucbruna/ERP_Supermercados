import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class PrecosService {
  private readonly logger = new Logger(PrecosService.name);

  constructor(private prisma: PrismaService) {}

  async consultarPreco(produtoId: string, clienteId?: string, tabelaId?: string) {
    const where: any = { produtoId };
    if (clienteId) where.clienteId = clienteId;
    if (tabelaId) where.tabelaId = tabelaId;

    const itens = await this.prisma.itemTabelaPreco.findMany({
      where: {
        produtoId,
        tabela: {
          ativo: true,
          dataInicio: { lte: new Date() },
          OR: [{ dataFim: null }, { dataFim: { gte: new Date() } }],
        },
        ...(clienteId ? { clienteId } : {}),
        ...(tabelaId ? { tabelaId } : {}),
      },
      include: { tabela: true },
      orderBy: { tabela: { createdAt: 'desc' } },
    });

    if (!itens.length) {
      return { success: true, data: { produtoId, precos: [], precoAtual: null } };
    }

    itens.sort((a, b) => Number(a.preco) - Number(b.preco));
    const precoAtual = itens[0];

    return {
      success: true,
      data: {
        produtoId,
        precoAtual: {
          valor: Number(precoAtual.preco),
          tabela: precoAtual.tabela.nome,
          tipo: precoAtual.tabela.tipo,
        },
        historico: itens.slice(0, 5).map((item) => ({
          preco: Number(item.preco),
          precoMinimo: item.precoMinimo ? Number(item.precoMinimo) : null,
          tabela: item.tabela.nome,
          tipo: item.tabela.tipo,
        })),
      },
    };
  }

  async getPrecoHistory(produtoId: string) {
    const itens = await this.prisma.itemTabelaPreco.findMany({
      where: { produtoId },
      include: { tabela: true },
      orderBy: { tabela: { createdAt: 'desc' } },
      take: 5,
    });

    return {
      success: true,
      data: itens.map((item) => ({
        preco: Number(item.preco),
        precoMinimo: item.precoMinimo ? Number(item.precoMinimo) : null,
        tabela: item.tabela.nome,
        tipo: item.tabela.tipo,
        dataInicio: item.tabela.dataInicio,
        dataFim: item.tabela.dataFim,
      })),
    };
  }
}
