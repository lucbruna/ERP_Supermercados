import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateConciliacaoDto, UpdateConciliacaoDto, QueryConciliacaoDto } from './dto/conciliacao.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ConciliacaoService {
  private readonly logger = new Logger(ConciliacaoService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateConciliacaoDto) {
    const conciliacao = await this.prisma.conciliacaoBancaria.create({
      data: {
        contaBancariaId: dto.contaBancariaId,
        mes: dto.mes,
        ano: dto.ano,
        saldoInicial: new Prisma.Decimal(dto.saldoInicial),
        saldoFinal: new Prisma.Decimal(dto.saldoFinal),
        lancamentosConciliados: dto.lancamentosConciliados || 0,
        lancamentosPendentes: dto.lancamentosPendentes || 0,
        diferencas: new Prisma.Decimal(dto.diferencas || 0),
        status: dto.status,
      },
    });
    return { success: true, data: conciliacao };
  }

  async findAll(query: QueryConciliacaoDto) {
    const pagina = query.pagina || 1;
    const limite = query.limite || 50;
    const skip = (pagina - 1) * limite;

    const where: any = {};
    if (query.contaBancariaId) where.contaBancariaId = query.contaBancariaId;
    if (query.mes) where.mes = query.mes;
    if (query.ano) where.ano = query.ano;
    if (query.status) where.status = query.status;

    const [data, total] = await Promise.all([
      this.prisma.conciliacaoBancaria.findMany({
        where,
        skip,
        take: limite,
        orderBy: [{ ano: 'desc' }, { mes: 'desc' }],
        include: { contaBancaria: { select: { banco: true, conta: true, agencia: true } } },
      }),
      this.prisma.conciliacaoBancaria.count({ where }),
    ]);

    return {
      success: true,
      data,
      meta: { pagina, limite, total, totalPaginas: Math.ceil(total / limite) },
    };
  }

  async findOne(id: string) {
    const conciliacao = await this.prisma.conciliacaoBancaria.findUnique({
      where: { id },
      include: { contaBancaria: true },
    });
    if (!conciliacao) throw new NotFoundException('Conciliação não encontrada');
    return { success: true, data: conciliacao };
  }

  async update(id: string, dto: UpdateConciliacaoDto) {
    await this.findOne(id);
    const data: any = {};
    if (dto.saldoInicial) data.saldoInicial = new Prisma.Decimal(dto.saldoInicial);
    if (dto.saldoFinal) data.saldoFinal = new Prisma.Decimal(dto.saldoFinal);
    if (dto.lancamentosConciliados) data.lancamentosConciliados = dto.lancamentosConciliados;
    if (dto.lancamentosPendentes) data.lancamentosPendentes = dto.lancamentosPendentes;
    if (dto.diferencas) data.diferencas = new Prisma.Decimal(dto.diferencas);
    if (dto.status) data.status = dto.status;

    const conciliacao = await this.prisma.conciliacaoBancaria.update({ where: { id }, data });
    return { success: true, data: conciliacao };
  }

  async conciliar(id: string) {
    await this.findOne(id);
    const conciliacao = await this.prisma.conciliacaoBancaria.update({
      where: { id },
      data: { status: 'CONCILIADA', lancamentosConciliados: { increment: 1 } },
    });
    return { success: true, data: conciliacao };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.conciliacaoBancaria.delete({ where: { id } });
    return { success: true, message: 'Conciliação removida com sucesso' };
  }
}
