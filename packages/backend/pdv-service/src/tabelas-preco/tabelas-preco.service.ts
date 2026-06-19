import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateTabelaPrecoDto, UpdateTabelaPrecoDto, TabelaPrecoQueryDto, CalcularPrecoDto, AdicionarItemPrecoDto } from './dto/create-tabela-preco.dto';

@Injectable()
export class TabelasPrecoService {
  private readonly logger = new Logger(TabelasPrecoService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTabelaPrecoDto) {
    const { itens, ...data } = dto;
    const tabela = await this.prisma.tabelaPreco.create({
      data: {
        ...data,
        dataInicio: data.dataInicio ? new Date(data.dataInicio) : null,
        dataFim: data.dataFim ? new Date(data.dataFim) : null,
        itens: itens?.length ? {
          create: itens.map(item => ({
            produtoId: item.produtoId,
            preco: item.preco,
            precoMinimo: item.precoMinimo,
            quantidadeMinima: item.quantidadeMinima,
            clienteId: item.clienteId,
          })),
        } : undefined,
      },
      include: { itens: true },
    });
    return { success: true, data: tabela };
  }

  async findAll(companyId: string, query: TabelaPrecoQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = { companyId };
    if (query.search) where.nome = { contains: query.search, mode: 'insensitive' };
    if (query.tipo) where.tipo = query.tipo;
    if (query.ativo !== undefined) where.ativo = query.ativo;

    const [data, total] = await Promise.all([
      this.prisma.tabelaPreco.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { itens: true } } },
      }),
      this.prisma.tabelaPreco.count({ where }),
    ]);

    return {
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const tabela = await this.prisma.tabelaPreco.findUnique({
      where: { id },
      include: { itens: true },
    });
    if (!tabela) throw new NotFoundException('Tabela de preço não encontrada');
    return { success: true, data: tabela };
  }

  async update(id: string, dto: UpdateTabelaPrecoDto) {
    await this.findOne(id);
    const tabela = await this.prisma.tabelaPreco.update({
      where: { id },
      data: {
        ...dto,
        dataInicio: dto.dataInicio ? new Date(dto.dataInicio) : undefined,
        dataFim: dto.dataFim ? new Date(dto.dataFim) : undefined,
      },
    });
    return { success: true, data: tabela };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.tabelaPreco.delete({ where: { id } });
    return { success: true };
  }

  async adicionarItem(tabelaId: string, dto: AdicionarItemPrecoDto) {
    await this.findOne(tabelaId);
    const item = await this.prisma.itemTabelaPreco.create({
      data: {
        tabelaId,
        produtoId: dto.produtoId,
        preco: dto.preco,
        precoMinimo: dto.precoMinimo,
        quantidadeMinima: dto.quantidadeMinima,
        clienteId: dto.clienteId,
      },
    });
    return { success: true, data: item };
  }

  async removerItem(itemId: string) {
    const item = await this.prisma.itemTabelaPreco.findUnique({ where: { id: itemId } });
    if (!item) throw new NotFoundException('Item não encontrado');
    await this.prisma.itemTabelaPreco.delete({ where: { id: itemId } });
    return { success: true };
  }

  async calcularPreco(dto: CalcularPrecoDto) {
    const { produtoId, clienteId, quantidade = 1 } = dto;

    const tabelas = await this.prisma.tabelaPreco.findMany({
      where: {
        ativo: true,
        dataInicio: { lte: new Date() },
        OR: [
          { dataFim: null },
          { dataFim: { gte: new Date() } },
        ],
      },
      include: { itens: true },
      orderBy: { createdAt: 'desc' },
    });

    const itensDisponiveis: { tabelaId: string; tabelaNome: string; tipo: string; preco: number; quantidadeMinima?: number; clienteId?: string }[] = [];
    for (const tabela of tabelas) {
      for (const item of tabela.itens) {
        if (item.produtoId !== produtoId) continue;
        if (item.clienteId && item.clienteId !== clienteId) continue;
        if (item.quantidadeMinima && quantidade < item.quantidadeMinima) continue;
        itensDisponiveis.push({
          tabelaId: tabela.id,
          tabelaNome: tabela.nome,
          tipo: tabela.tipo,
          preco: Number(item.preco),
          quantidadeMinima: item.quantidadeMinima || undefined,
          clienteId: item.clienteId || undefined,
        });
      }
    }

    itensDisponiveis.sort((a, b) => a.preco - b.preco);
    const melhor = itensDisponiveis[0] || null;

    return {
      success: true,
      data: {
        produtoId,
        quantidade,
        clienteId,
        precoOriginal: null,
        precoFinal: melhor?.preco || null,
        tabelaAplicada: melhor?.tabelaNome || null,
        tipoAplicado: melhor?.tipo || null,
        itensDisponiveis,
      },
    };
  }

  async calcularPrecoBatch(companyId: string, items: { produtoId: string; quantidade?: number; clienteId?: string }[]) {
    const resultados = [];
    for (const item of items) {
      const result = await this.calcularPreco({
        produtoId: item.produtoId,
        clienteId: item.clienteId,
        quantidade: item.quantidade || 1,
      });
      resultados.push(result.data);
    }
    return { success: true, data: resultados };
  }

  private filtrarItens(tabela: any, produtoId: string, clienteId?: string, quantidade?: number) {
    return tabela.itens.filter((item: any) => {
      if (item.produtoId !== produtoId) return false;
      if (item.clienteId && item.clienteId !== clienteId) return false;
      if (item.quantidadeMinima && quantidade && quantidade < item.quantidadeMinima) return false;
      return true;
    });
  }

  private obterMotivo(tipo: string, item: any): string {
    switch (tipo) {
      case 'PROMOCIONAL': return 'Preço promocional';
      case 'CLIENTE': return 'Preço especial para cliente';
      case 'QUANTIDADE': return `Preço por quantidade (mín: ${item.quantidadeMinima})`;
      case 'ATACADO': return 'Preço atacado';
      default: return 'Tabela de preço';
    }
  }
}
