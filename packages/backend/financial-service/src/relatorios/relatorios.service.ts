import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { RelatorioFluxoCaixaDto, RelatorioAgingDto, RelatorioDreDto } from './dto/relatorio.dto';

@Injectable()
export class RelatoriosService {
  private readonly logger = new Logger(RelatoriosService.name);

  constructor(private prisma: PrismaService) {}

  async relatorioFluxoCaixa(dto: RelatorioFluxoCaixaDto) {
    const dataInicio = new Date(dto.dataInicio);
    const dataFim = new Date(dto.dataFim);

    const lancamentos = await this.prisma.lancamentoCaixa.findMany({
      where: {
        companyId: dto.companyId,
        unidadeId: dto.unidadeId || undefined,
        dataHora: { gte: dataInicio, lte: dataFim },
      },
      orderBy: { dataHora: 'asc' },
    });

    const entradas = lancamentos.filter((l) => l.tipo === 'ENTRADA');
    const saidas = lancamentos.filter((l) => l.tipo === 'SAIDA');

    const totalEntradas = entradas.reduce((acc, l) => acc + Number(l.valor), 0);
    const totalSaidas = saidas.reduce((acc, l) => acc + Number(l.valor), 0);

    const porCategoria: Record<string, { entradas: number; saidas: number }> = {};
    lancamentos.forEach((l) => {
      if (!porCategoria[l.categoria]) porCategoria[l.categoria] = { entradas: 0, saidas: 0 };
      if (l.tipo === 'ENTRADA') porCategoria[l.categoria].entradas += Number(l.valor);
      else porCategoria[l.categoria].saidas += Number(l.valor);
    });

    const saldoAnterior = await this.calcularSaldoAte(dto.companyId, dataInicio);

    return {
      success: true,
      data: {
        periodo: { inicio: dto.dataInicio, fim: dto.dataFim },
        saldoAnterior,
        totalEntradas,
        totalSaidas,
        saldoFinal: saldoAnterior + totalEntradas - totalSaidas,
        resumo: { entradas: entradas.length, saidas: saidas.length, totalLancamentos: lancamentos.length },
        porCategoria: Object.entries(porCategoria).map(([categoria, valores]) => ({
          categoria,
          entradas: valores.entradas,
          saidas: valores.saidas,
          saldo: valores.entradas - valores.saidas,
        })),
        lancamentos,
      },
    };
  }

  async relatorioAging(dto: RelatorioAgingDto) {
    const dataBase = dto.dataBase ? new Date(dto.dataBase) : new Date();
    const pagina = dto.pagina || 1;
    const limite = dto.limite || 100;

    const where: any = {
      companyId: dto.companyId,
      status: { in: ['PENDENTE', 'VENCIDA'] },
    };

    const [contasPagar, contasReceber] = await Promise.all([
      this.prisma.contaPagar.findMany({ where, orderBy: { dataVencimento: 'asc' } }),
      this.prisma.contaReceber.findMany({ where, orderBy: { dataVencimento: 'asc' } }),
    ]);

    const calcularFaixa = (vencimento: Date) => {
      const diff = Math.floor((dataBase.getTime() - vencimento.getTime()) / (1000 * 60 * 60 * 24));
      if (diff <= 0) return 'A_VENCER';
      if (diff <= 30) return 'ATE_30_DIAS';
      if (diff <= 60) return '31_A_60_DIAS';
      if (diff <= 90) return '61_A_90_DIAS';
      if (diff <= 180) return '91_A_180_DIAS';
      return 'ACIMA_180_DIAS';
    };

    const agruparPorFaixa = (contas: any[]) => {
      const faixas: Record<string, { quantidade: number; valorTotal: number; contas: any[] }> = {
        A_VENCER: { quantidade: 0, valorTotal: 0, contas: [] },
        ATE_30_DIAS: { quantidade: 0, valorTotal: 0, contas: [] },
        '31_A_60_DIAS': { quantidade: 0, valorTotal: 0, contas: [] },
        '61_A_90_DIAS': { quantidade: 0, valorTotal: 0, contas: [] },
        '91_A_180_DIAS': { quantidade: 0, valorTotal: 0, contas: [] },
        ACIMA_180_DIAS: { quantidade: 0, valorTotal: 0, contas: [] },
      };

      contas.forEach((c) => {
        const faixa = calcularFaixa(c.dataVencimento);
        faixas[faixa].quantidade++;
        faixas[faixa].valorTotal += Number(c.valorNominal);
        faixas[faixa].contas.push(c);
      });

      return faixas;
    };

    return {
      success: true,
      data: {
        dataBase: dataBase.toISOString(),
        contasPagar: agruparPorFaixa(contasPagar),
        contasReceber: agruparPorFaixa(contasReceber),
        totalAPagar: contasPagar.reduce((acc, c) => acc + Number(c.valorNominal), 0),
        totalAReceber: contasReceber.reduce((acc, c) => acc + Number(c.valorNominal), 0),
      },
    };
  }

  async relatorioDre(dto: RelatorioDreDto) {
    const dataInicio = new Date(dto.dataInicio);
    const dataFim = new Date(dto.dataFim);

    const lancamentos = await this.prisma.lancamentoCaixa.findMany({
      where: {
        companyId: dto.companyId,
        unidadeId: dto.unidadeId || undefined,
        dataHora: { gte: dataInicio, lte: dataFim },
      },
    });

    const receitas = lancamentos
      .filter((l) => l.tipo === 'ENTRADA')
      .reduce((acc, l) => acc + Number(l.valor), 0);

    const despesas = lancamentos
      .filter((l) => l.tipo === 'SAIDA')
      .reduce((acc, l) => acc + Number(l.valor), 0);

    const porCategoria = lancamentos.reduce(
      (acc, l) => {
        if (!acc[l.categoria]) acc[l.categoria] = { receita: 0, despesa: 0 };
        if (l.tipo === 'ENTRADA') acc[l.categoria].receita += Number(l.valor);
        else acc[l.categoria].despesa += Number(l.valor);
        return acc;
      },
      {} as Record<string, { receita: number; despesa: number }>,
    );

    return {
      success: true,
      data: {
        periodo: { inicio: dto.dataInicio, fim: dto.dataFim },
        receitaBruta: receitas,
        deducoes: 0,
        receitaLiquida: receitas,
        despesasOperacionais: despesas,
        despesasAdministrativas: 0,
        despesasFinanceiras: 0,
        resultadoOperacional: receitas - despesas,
        resultadoLiquido: receitas - despesas,
        porCategoria: Object.entries(porCategoria).map(([categoria, valores]) => ({
          categoria,
          receita: valores.receita,
          despesa: valores.despesa,
          saldo: valores.receita - valores.despesa,
        })),
      },
    };
  }

  private async calcularSaldoAte(companyId: string, data: Date): Promise<number> {
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
}
