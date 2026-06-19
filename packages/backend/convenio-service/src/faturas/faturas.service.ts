import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { FaturaStatus } from '@prisma/client';
import { CreateFaturaDto, PagarFaturaDto, FaturaQueryDto } from './dto/faturas.dto';

@Injectable()
export class FaturasService {
  private readonly logger = new Logger(FaturasService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateFaturaDto) {
    const convenio = await this.prisma.convenio.findUnique({ where: { id: dto.convenioId } });
    if (!convenio) throw new NotFoundException('Convênio não encontrado');

    const existing = await this.prisma.faturaConvenio.findUnique({ where: { numero: dto.numero } });
    if (existing) throw new BadRequestException('Número de fatura já existe');

    const fatura = await this.prisma.faturaConvenio.create({
      data: {
        companyId: dto.companyId,
        convenioId: dto.convenioId,
        numero: dto.numero,
        dataEmissao: new Date(dto.dataEmissao),
        dataVencimento: new Date(dto.dataVencimento),
        valorTotal: dto.valorTotal,
        observacao: dto.observacao,
      },
    });

    this.logger.log(`Fatura criada: ${fatura.numero} - R$ ${dto.valorTotal}`);
    return { success: true, data: fatura };
  }

  async findAll(query: FaturaQueryDto) {
    const where: any = {};
    if (query.convenioId) where.convenioId = query.convenioId;
    if (query.status) where.status = query.status;
    if (query.dataInicio || query.dataFim) {
      where.dataVencimento = {};
      if (query.dataInicio) where.dataVencimento.gte = new Date(query.dataInicio);
      if (query.dataFim) where.dataVencimento.lte = new Date(query.dataFim);
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.faturaConvenio.findMany({
        where,
        skip,
        take: limit,
        orderBy: { dataVencimento: 'asc' },
        include: { convenio: { select: { id: true, nome: true, codigo: true } } },
      }),
      this.prisma.faturaConvenio.count({ where }),
    ]);

    return {
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const fatura = await this.prisma.faturaConvenio.findUnique({
      where: { id },
      include: {
        convenio: { select: { id: true, nome: true, codigo: true } },
        vendas: { orderBy: { dataVenda: 'desc' } },
      },
    });
    if (!fatura) throw new NotFoundException('Fatura não encontrada');
    return { success: true, data: fatura };
  }

  async pagar(id: string, dto: PagarFaturaDto) {
    const fatura = await this.prisma.faturaConvenio.findUnique({ where: { id } });
    if (!fatura) throw new NotFoundException('Fatura não encontrada');
    if (fatura.status === 'PAGA' || fatura.status === 'CANCELADA') {
      throw new BadRequestException(`Fatura já está ${fatura.status.toLowerCase()}`);
    }

    const dataPagamento = dto.dataPagamento ? new Date(dto.dataPagamento) : new Date();
    const multa = dto.multa ?? 0;
    const juros = dto.juros ?? 0;
    const desconto = dto.desconto ?? 0;

    const valorOriginal = Number(fatura.valorTotal);
    let valorPago = dto.valorPago ?? (valorOriginal + multa + juros - desconto);

    let novoStatus: FaturaStatus = valorPago >= valorOriginal ? 'PAGA' : 'PARCIAL';

    const updated = await this.prisma.faturaConvenio.update({
      where: { id },
      data: {
        dataPagamento,
        valorPago,
        multa,
        juros,
        desconto,
        formaPagamento: dto.formaPagamento,
        observacao: dto.observacao,
        status: novoStatus,
      },
    });

    this.logger.log(`Fatura ${fatura.numero} paga: R$ ${valorPago} (status: ${novoStatus})`);

    if (novoStatus === 'PAGA') {
      await this.prisma.convenio.update({
        where: { id: fatura.convenioId },
        data: { saldoUtilizado: { decrement: valorOriginal } },
      });
    }

    return { success: true, data: updated };
  }

  async cancelar(id: string) {
    const fatura = await this.prisma.faturaConvenio.findUnique({
      where: { id },
      include: { vendas: { where: { status: { not: 'CANCELADA' } } } },
    });
    if (!fatura) throw new NotFoundException('Fatura não encontrada');
    if (fatura.status === 'PAGA' || fatura.status === 'CANCELADA') {
      throw new BadRequestException(`Fatura já está ${fatura.status.toLowerCase()}`);
    }

    await this.prisma.$transaction([
      this.prisma.faturaConvenio.update({
        where: { id },
        data: { status: 'CANCELADA' as FaturaStatus },
      }),
      this.prisma.convenio.update({
        where: { id: fatura.convenioId },
        data: { saldoUtilizado: { decrement: Number(fatura.valorTotal) } },
      }),
    ]);

    await this.prisma.vendaConvenio.updateMany({
      where: { faturaId: id },
      data: { faturaId: null },
    });

    this.logger.log(`Fatura cancelada: ${fatura.numero}`);
    return { success: true, message: 'Fatura cancelada' };
  }

  async gerarBoletos(id: string) {
    const fatura = await this.findOne(id);
    if (fatura.data.status === 'PAGA' || fatura.data.status === 'CANCELADA') {
      throw new BadRequestException('Não é possível gerar boleto para fatura paga ou cancelada');
    }

    this.logger.log(`Boletos gerados para fatura: ${fatura.data.numero}`);
    return {
      success: true,
      data: {
        message: 'Boletos gerados com sucesso',
        fatura: fatura.data.numero,
        url: `https://boleto.exemplo.com/${fatura.data.id}`,
        codigoBarras: `${fatura.data.numero.replace(/\D/g, '').padStart(44, '0')}`,
      },
    };
  }
}
