import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { GerarProjecaoDto, QueryFluxoCaixaDto, SaldoDiarioDto } from './dto/fluxo-caixa.dto';
import { Prisma, TipoFluxo } from '@prisma/client';

@Injectable()
export class FluxoCaixaService {
  private readonly logger = new Logger(FluxoCaixaService.name);

  constructor(private prisma: PrismaService) {}

  async consultarSaldo(query: QueryFluxoCaixaDto) {
    const pagina = query.pagina || 1;
    const limite = query.limite || 50;
    const skip = (pagina - 1) * limite;

    const where: any = { companyId: query.companyId };
    if (query.unidadeId) where.unidadeId = query.unidadeId;
    if (query.tipo) where.tipo = query.tipo;
    if (query.dataInicio || query.dataFim) {
      where.data = {};
      if (query.dataInicio) where.data.gte = new Date(query.dataInicio);
      if (query.dataFim) where.data.lte = new Date(query.dataFim);
    }

    const [data, total] = await Promise.all([
      this.prisma.fluxoCaixaProjecao.findMany({
        where,
        skip,
        take: limite,
        orderBy: { data: 'desc' },
      }),
      this.prisma.fluxoCaixaProjecao.count({ where }),
    ]);

    return {
      success: true,
      data,
      meta: { pagina, limite, total, totalPaginas: Math.ceil(total / limite) },
    };
  }

  async gerarProjecao(dto: GerarProjecaoDto) {
    const dataInicio = new Date(dto.dataInicio);
    const dataFim = new Date(dto.dataFim);
    const dias: SaldoDiarioDto[] = [];

    const lancamentos = await this.prisma.lancamentoCaixa.findMany({
      where: {
        companyId: dto.companyId,
        unidadeId: dto.unidadeId || undefined,
        dataHora: { gte: dataInicio, lte: dataFim },
      },
      orderBy: { dataHora: 'asc' },
    });

    const contasPagar = await this.prisma.contaPagar.findMany({
      where: {
        companyId: dto.companyId,
        unidadeId: dto.unidadeId || undefined,
        dataVencimento: { gte: dataInicio, lte: dataFim },
        status: { in: ['PENDENTE', 'VENCIDA'] },
      },
    });

    const contasReceber = await this.prisma.contaReceber.findMany({
      where: {
        companyId: dto.companyId,
        unidadeId: dto.unidadeId || undefined,
        dataVencimento: { gte: dataInicio, lte: dataFim },
        status: { in: ['PENDENTE', 'VENCIDA'] },
      },
    });

    let saldoAtual = await this.calcularSaldoAtual(dto.companyId, dataInicio);

    for (let d = new Date(dataInicio); d <= dataFim; d.setDate(d.getDate() + 1)) {
      const diaStr = d.toISOString().split('T')[0];

      const entradasRealizadas = lancamentos
        .filter((l) => l.tipo === 'ENTRADA' && this.mesmoDia(l.dataHora, d))
        .reduce((acc, l) => acc + Number(l.valor), 0);

      const saidasRealizadas = lancamentos
        .filter((l) => l.tipo === 'SAIDA' && this.mesmoDia(l.dataHora, d))
        .reduce((acc, l) => acc + Number(l.valor), 0);

      const entradasProjetadas = contasReceber
        .filter((c) => this.mesmoDia(c.dataVencimento, d))
        .reduce((acc, c) => acc + Number(c.valorNominal), 0);

      const saidasProjetadas = contasPagar
        .filter((c) => this.mesmoDia(c.dataVencimento, d))
        .reduce((acc, c) => acc + Number(c.valorNominal), 0);

      const totalEntradas = entradasRealizadas + entradasProjetadas;
      const totalSaidas = saidasRealizadas + saidasProjetadas;
      const saldoFinal = saldoAtual + totalEntradas - totalSaidas;

      const saldoDiario: SaldoDiarioDto = {
        data: diaStr,
        saldoInicial: saldoAtual,
        totalEntradas,
        totalSaidas,
        saldoFinal,
        tipo: TipoFluxo.PROJETADO,
      };

      dias.push(saldoDiario);

      await this.prisma.fluxoCaixaProjecao.upsert({
        where: {
          id: `${dto.companyId}_${diaStr}`,
        },
        create: {
          id: `${dto.companyId}_${diaStr}`,
          companyId: dto.companyId,
          data: d,
          saldoInicial: new Prisma.Decimal(saldoAtual),
          totalEntradas: new Prisma.Decimal(totalEntradas),
          totalSaidas: new Prisma.Decimal(totalSaidas),
          saldoFinal: new Prisma.Decimal(saldoFinal),
          tipo: TipoFluxo.PROJETADO,
        },
        update: {
          saldoInicial: new Prisma.Decimal(saldoAtual),
          totalEntradas: new Prisma.Decimal(totalEntradas),
          totalSaidas: new Prisma.Decimal(totalSaidas),
          saldoFinal: new Prisma.Decimal(saldoFinal),
          tipo: TipoFluxo.PROJETADO,
        },
      });

      saldoAtual = saldoFinal;
    }

    return { success: true, data: dias };
  }

  async getResumo(companyId: string, dataInicio?: string, dataFim?: string) {
    const where: any = { companyId };
    if (dataInicio || dataFim) {
      where.dataVencimento = {};
      if (dataInicio) where.dataVencimento.gte = new Date(dataInicio);
      if (dataFim) where.dataVencimento.lte = new Date(dataFim);
    }

    const [totalContasPagar, totalContasReceber, saldoAtual] = await Promise.all([
      this.prisma.contaPagar.aggregate({
        where: { ...where, status: { in: ['PENDENTE', 'VENCIDA'] } },
        _sum: { valorNominal: true },
      }),
      this.prisma.contaReceber.aggregate({
        where: { ...where, status: { in: ['PENDENTE', 'VENCIDA'] } },
        _sum: { valorNominal: true },
      }),
      this.prisma.lancamentoCaixa.aggregate({
        where: { companyId },
        _sum: { valor: true },
      }),
    ]);

    return {
      success: true,
      data: {
        totalAPagar: Number(totalContasPagar._sum.valorNominal || 0),
        totalAReceber: Number(totalContasReceber._sum.valorNominal || 0),
        saldoPrevisto: Number(totalContasReceber._sum.valorNominal || 0) - Number(totalContasPagar._sum.valorNominal || 0),
      },
    };
  }

  private async calcularSaldoAtual(companyId: string, data: Date): Promise<number> {
    const ultimaProjecao = await this.prisma.fluxoCaixaProjecao.findFirst({
      where: { companyId, data: { lt: data } },
      orderBy: { data: 'desc' },
    });

    if (ultimaProjecao) return Number(ultimaProjecao.saldoFinal);

    const entradas = await this.prisma.lancamentoCaixa.aggregate({
      where: { companyId, tipo: 'ENTRADA', dataHora: { lt: data } },
      _sum: { valor: true },
    });

    const saidas = await this.prisma.lancamentoCaixa.aggregate({
      where: { companyId, tipo: 'SAIDA', dataHora: { lt: data } },
      _sum: { valor: true },
    });

    return Number(entradas._sum.valor || 0) - Number(saidas._sum.valor || 0);
  }

  private mesmoDia(d1: Date, d2: Date): boolean {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }
}
