import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateMovimentoDto, MovimentoQueryDto } from './dto/create-movimento.dto';
import { TipoMovimento } from '@prisma/client';

@Injectable()
export class MovimentosService {
  private readonly logger = new Logger(MovimentosService.name);

  constructor(private prisma: PrismaService) {}

  async registrarMovimento(dto: CreateMovimentoDto) {
    const produto = await this.prisma.produto.findUnique({ where: { id: dto.produtoId } });
    if (!produto) throw new NotFoundException('Produto não encontrado');
    if (!produto.ativo) throw new BadRequestException('Produto inativo');

    const saldoAnterior = Number(produto.estoqueAtual);
    let saldoAtual: number;

    switch (dto.tipo) {
      case 'ENTRADA':
        saldoAtual = saldoAnterior + dto.quantidade;
        break;
      case 'SAIDA':
        if (saldoAnterior < dto.quantidade) {
          throw new BadRequestException(`Estoque insuficiente. Saldo atual: ${saldoAnterior}, solicitado: ${dto.quantidade}`);
        }
        saldoAtual = saldoAnterior - dto.quantidade;
        break;
      case 'AJUSTE':
        saldoAtual = dto.quantidade;
        break;
      default:
        saldoAtual = saldoAnterior + dto.quantidade;
    }

    const [movimento] = await this.prisma.$transaction([
      this.prisma.movimentoEstoque.create({
        data: {
          produtoId: dto.produtoId,
          unidadeId: dto.unidadeId,
          tipo: dto.tipo as TipoMovimento,
          quantidade: dto.quantidade,
          saldoAnterior,
          saldoAtual,
          documento: dto.documento,
          lote: dto.lote,
          validade: dto.validade ? new Date(dto.validade) : null,
          observacao: dto.observacao,
          usuarioId: dto.usuarioId,
          data: dto.data ? new Date(dto.data) : new Date(),
        },
      }),
      this.prisma.produto.update({
        where: { id: dto.produtoId },
        data: { estoqueAtual: saldoAtual },
      }),
    ]);

    this.logger.log(`Movimento ${dto.tipo} registrado: ${produto.descricao} qtd=${dto.quantidade}`);
    return { success: true, data: movimento };
  }

  async findAll(unidadeId: string, query: MovimentoQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = { unidadeId };
    if (query.produtoId) where.produtoId = query.produtoId;
    if (query.tipo) where.tipo = query.tipo;
    if (query.dataInicio || query.dataFim) {
      where.data = {};
      if (query.dataInicio) where.data.gte = new Date(query.dataInicio);
      if (query.dataFim) where.data.lte = new Date(query.dataFim);
    }

    const [data, total] = await Promise.all([
      this.prisma.movimentoEstoque.findMany({
        where,
        skip,
        take: limit,
        orderBy: { data: 'desc' },
        include: { produto: { select: { id: true, descricao: true, codigo: true, unidadeMedida: true } } },
      }),
      this.prisma.movimentoEstoque.count({ where }),
    ]);

    return {
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const movimento = await this.prisma.movimentoEstoque.findUnique({
      where: { id },
      include: { produto: { select: { id: true, descricao: true, codigo: true, unidadeMedida: true } } },
    });
    if (!movimento) throw new NotFoundException('Movimento não encontrado');
    return { success: true, data: movimento };
  }
}
