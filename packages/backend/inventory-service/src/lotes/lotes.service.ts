import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateLoteDto, LoteQueryDto } from './dto/create-lote.dto';

@Injectable()
export class LotesService {
  private readonly logger = new Logger(LotesService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateLoteDto) {
    const produto = await this.prisma.produto.findUnique({ where: { id: dto.produtoId } });
    if (!produto) throw new NotFoundException('Produto não encontrado');

    const lote = await this.prisma.lote.create({
      data: {
        produtoId: dto.produtoId,
        codigoLote: dto.codigoLote,
        dataFabricacao: new Date(dto.dataFabricacao),
        dataValidade: new Date(dto.dataValidade),
        quantidadeInicial: dto.quantidadeInicial,
        quantidadeAtual: dto.quantidadeAtual,
        recebidoEm: dto.recebidoEm ? new Date(dto.recebidoEm) : new Date(),
      },
      include: { produto: { select: { id: true, descricao: true, codigo: true } } },
    });

    this.logger.log(`Lote criado: ${lote.codigoLote} para produto ${produto.descricao}`);
    return { success: true, data: lote };
  }

  async findAll(query: LoteQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.produtoId) where.produtoId = query.produtoId;

    const [data, total] = await Promise.all([
      this.prisma.lote.findMany({
        where,
        skip,
        take: limit,
        orderBy: { dataValidade: 'asc' },
        include: { produto: { select: { id: true, descricao: true, codigo: true } } },
      }),
      this.prisma.lote.count({ where }),
    ]);

    return {
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const lote = await this.prisma.lote.findUnique({
      where: { id },
      include: { produto: { select: { id: true, descricao: true, codigo: true, unidadeMedida: true } } },
    });
    if (!lote) throw new NotFoundException('Lote não encontrado');
    return { success: true, data: lote };
  }

  async baixar(id: string, quantidade: number) {
    const lote = await this.prisma.lote.findUnique({ where: { id } });
    if (!lote) throw new NotFoundException('Lote não encontrado');

    if (Number(lote.quantidadeAtual) < quantidade) {
      throw new BadRequestException(`Quantidade insuficiente no lote. Disponível: ${lote.quantidadeAtual}`);
    }

    const updated = await this.prisma.lote.update({
      where: { id },
      data: { quantidadeAtual: { decrement: quantidade } },
      include: { produto: { select: { id: true, descricao: true, codigo: true } } },
    });

    this.logger.log(`Lote ${lote.codigoLote} baixado em ${quantidade}`);
    return { success: true, data: updated };
  }

  async proximosVencer(dias: number) {
    const limite = new Date();
    limite.setDate(limite.getDate() + dias);

    const lotes = await this.prisma.lote.findMany({
      where: {
        quantidadeAtual: { gt: 0 },
        dataValidade: { lte: limite },
      },
      orderBy: { dataValidade: 'asc' },
      include: { produto: { select: { id: true, descricao: true, codigo: true } } },
    });

    return { success: true, data: lotes };
  }
}
