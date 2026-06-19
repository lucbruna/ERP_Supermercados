import { Injectable, NotFoundException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateVendaConvenioDto, VendaConvenioQueryDto } from './dto/vendas.dto';

@Injectable()
export class VendasService {
  private readonly logger = new Logger(VendasService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateVendaConvenioDto) {
    const convenio = await this.prisma.convenio.findUnique({ where: { id: dto.convenioId } });
    if (!convenio) throw new NotFoundException('Convênio não encontrado');
    if (convenio.status !== 'ATIVO') throw new BadRequestException('Convênio não está ativo');

    if (dto.contratoId) {
      const contrato = await this.prisma.contrato.findUnique({ where: { id: dto.contratoId } });
      if (!contrato) throw new NotFoundException('Contrato não encontrado');
      if (contrato.status !== 'ATIVO') throw new BadRequestException('Contrato não está ativo');
    }

    const saldoDisponivel = Number(convenio.limiteGlobal) - Number(convenio.saldoUtilizado);
    if (dto.valorLiquido > saldoDisponivel) {
      throw new BadRequestException(
        `Valor da venda (R$ ${dto.valorLiquido.toFixed(2)}) excede o saldo disponível (R$ ${saldoDisponivel.toFixed(2)})`,
      );
    }

    const existing = await this.prisma.vendaConvenio.findUnique({ where: { numero: dto.numero } });
    if (existing) throw new ConflictException('Número de venda já existe');

    const [venda] = await this.prisma.$transaction([
      this.prisma.vendaConvenio.create({
        data: {
          companyId: dto.companyId,
          unidadeId: dto.unidadeId,
          pdvId: dto.pdvId,
          convenioId: dto.convenioId,
          contratoId: dto.contratoId,
          clienteId: dto.clienteId,
          clienteNome: dto.clienteNome,
          clienteCpf: dto.clienteCpf,
          numero: dto.numero,
          itens: dto.itens ?? [],
          valorBruto: dto.valorBruto,
          desconto: dto.desconto ?? 0,
          valorLiquido: dto.valorLiquido,
          dataVenda: new Date(dto.dataVenda),
          ...(dto.dataVencimento && { dataVencimento: new Date(dto.dataVencimento) }),
          observacao: dto.observacao,
        },
      }),
      this.prisma.convenio.update({
        where: { id: dto.convenioId },
        data: { saldoUtilizado: { increment: dto.valorLiquido } },
      }),
    ]);

    this.logger.log(`Venda criada: ${venda.numero} - R$ ${dto.valorLiquido}`);
    return { success: true, data: venda };
  }

  async findAll(query: VendaConvenioQueryDto) {
    const where: any = {};
    if (query.convenioId) where.convenioId = query.convenioId;
    if (query.contratoId) where.contratoId = query.contratoId;
    if (query.status) where.status = query.status;
    if (query.dataInicio || query.dataFim) {
      where.dataVenda = {};
      if (query.dataInicio) where.dataVenda.gte = new Date(query.dataInicio);
      if (query.dataFim) where.dataVenda.lte = new Date(query.dataFim);
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.vendaConvenio.findMany({
        where,
        skip,
        take: limit,
        orderBy: { dataVenda: 'desc' },
        include: { convenio: { select: { id: true, nome: true, codigo: true } } },
      }),
      this.prisma.vendaConvenio.count({ where }),
    ]);

    return {
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const venda = await this.prisma.vendaConvenio.findUnique({
      where: { id },
      include: {
        convenio: { select: { id: true, nome: true, codigo: true } },
        contrato: { select: { id: true, numero: true } },
      },
    });
    if (!venda) throw new NotFoundException('Venda não encontrada');
    return { success: true, data: venda };
  }

  async cancelar(id: string) {
    const venda = await this.prisma.vendaConvenio.findUnique({ where: { id } });
    if (!venda) throw new NotFoundException('Venda não encontrada');
    if (venda.status === 'CANCELADA') throw new BadRequestException('Venda já está cancelada');
    if (venda.faturaId) throw new BadRequestException('Não é possível cancelar venda vinculada a uma fatura');

    const [cancelada] = await this.prisma.$transaction([
      this.prisma.vendaConvenio.update({
        where: { id },
        data: { status: 'CANCELADA' },
      }),
      this.prisma.convenio.update({
        where: { id: venda.convenioId },
        data: { saldoUtilizado: { decrement: Number(venda.valorLiquido) } },
      }),
    ]);

    this.logger.log(`Venda cancelada: ${cancelada.numero}`);
    return { success: true, data: cancelada };
  }
}
