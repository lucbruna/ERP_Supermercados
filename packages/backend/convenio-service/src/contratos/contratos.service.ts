import { Injectable, NotFoundException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { FaturasService } from '../faturas/faturas.service';
import { ContratoStatus } from '@prisma/client';
import { CreateContratoDto, UpdateContratoDto, ContratoQueryDto } from './dto/contratos.dto';

@Injectable()
export class ContratosService {
  private readonly logger = new Logger(ContratosService.name);

  constructor(
    private prisma: PrismaService,
    private faturasService: FaturasService,
  ) {}

  async create(dto: CreateContratoDto) {
    const convenio = await this.prisma.convenio.findUnique({ where: { id: dto.convenioId } });
    if (!convenio) throw new NotFoundException('Convênio não encontrado');

    const existing = await this.prisma.contrato.findUnique({ where: { numero: dto.numero } });
    if (existing) throw new ConflictException('Número de contrato já existe');

    if (dto.limiteMensal && Number(dto.limiteMensal) > Number(convenio.limiteGlobal)) {
      throw new BadRequestException('Limite mensal não pode exceder o limite global do convênio');
    }

    const contrato = await this.prisma.contrato.create({
      data: {
        convenioId: dto.convenioId,
        numero: dto.numero,
        dataInicio: new Date(dto.dataInicio),
        ...(dto.dataFim && { dataFim: new Date(dto.dataFim) }),
        valor: dto.valor,
        ...(dto.limiteMensal !== undefined && { limiteMensal: dto.limiteMensal }),
        carencia: dto.carencia ?? 0,
        taxaJuros: dto.taxaJuros ?? 0,
        multaAtraso: dto.multaAtraso ?? 2,
        jurosMora: dto.jurosMora ?? 1,
        observacao: dto.observacao,
        anexos: dto.anexos ?? [],
      },
    });

    this.logger.log(`Contrato criado: ${contrato.numero}`);
    return { success: true, data: contrato };
  }

  async findAll(query: ContratoQueryDto) {
    const where: any = {};
    if (query.convenioId) where.convenioId = query.convenioId;
    if (query.status) where.status = query.status;

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.contrato.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { convenio: { select: { id: true, nome: true, codigo: true } } },
      }),
      this.prisma.contrato.count({ where }),
    ]);

    return {
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const contrato = await this.prisma.contrato.findUnique({
      where: { id },
      include: {
        convenio: { select: { id: true, nome: true, codigo: true } },
        vendas: { orderBy: { dataVenda: 'desc' }, take: 50 },
      },
    });
    if (!contrato) throw new NotFoundException('Contrato não encontrado');
    return { success: true, data: contrato };
  }

  async update(id: string, dto: UpdateContratoDto) {
    await this.findOne(id);
    const updated = await this.prisma.contrato.update({
      where: { id },
      data: {
        ...(dto.dataInicio !== undefined && { dataInicio: new Date(dto.dataInicio) }),
        ...(dto.dataFim !== undefined && { dataFim: dto.dataFim ? new Date(dto.dataFim) : null }),
        ...(dto.valor !== undefined && { valor: dto.valor }),
        ...(dto.limiteMensal !== undefined && { limiteMensal: dto.limiteMensal }),
        ...(dto.carencia !== undefined && { carencia: dto.carencia }),
        ...(dto.taxaJuros !== undefined && { taxaJuros: dto.taxaJuros }),
        ...(dto.multaAtraso !== undefined && { multaAtraso: dto.multaAtraso }),
        ...(dto.jurosMora !== undefined && { jurosMora: dto.jurosMora }),
        ...(dto.observacao !== undefined && { observacao: dto.observacao }),
        ...(dto.status !== undefined && { status: dto.status as ContratoStatus }),
      },
    });
    return { success: true, data: updated };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.contrato.update({ where: { id }, data: { status: 'CANCELADO' as ContratoStatus } });
    return { success: true, message: 'Contrato cancelado' };
  }

  async gerarFatura(id: string) {
    const contrato = await this.prisma.contrato.findUnique({
      where: { id },
      include: {
        vendas: { where: { faturaId: null, status: { not: 'CANCELADA' } } },
        convenio: true,
      },
    });
    if (!contrato) throw new NotFoundException('Contrato não encontrado');

    const vendasNaoFaturadas = contrato.vendas;
    if (vendasNaoFaturadas.length === 0) {
      throw new BadRequestException('Nenhuma venda pendente de faturamento neste contrato');
    }

    const valorTotal = vendasNaoFaturadas.reduce((sum, v) => sum + Number(v.valorLiquido), 0);

    if (contrato.limiteMensal && valorTotal > Number(contrato.limiteMensal)) {
      throw new BadRequestException(
        `Valor total de R$ ${valorTotal.toFixed(2)} excede o limite mensal de R$ ${Number(contrato.limiteMensal).toFixed(2)} do contrato`,
      );
    }

    const fatura = await this.faturasService.create({
      companyId: contrato.convenio.companyId,
      convenioId: contrato.convenioId,
      numero: `FAT-${contrato.numero}-${Date.now()}`,
      dataEmissao: new Date().toISOString(),
      dataVencimento: new Date(Date.now() + contrato.convenio.prazoPagamento * 86400000).toISOString(),
      valorTotal,
      observacao: `Fatura gerada do contrato ${contrato.numero}`,
    });

    await this.prisma.vendaConvenio.updateMany({
      where: { id: { in: vendasNaoFaturadas.map((v) => v.id) } },
      data: { faturaId: fatura.data.id },
    });

    this.logger.log(`Fatura ${fatura.data.numero} gerada para contrato ${contrato.numero}`);
    return { success: true, data: fatura.data, vendasFaturadas: vendasNaoFaturadas.length };
  }
}
