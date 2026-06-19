import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private prisma: PrismaService) {}

  async resumo() {
    const [totalVeiculos, veiculosAtivos, manutencoesPendentes, kmTotal] = await Promise.all([
      this.prisma.veiculo.count(),
      this.prisma.veiculo.count({ where: { situacao: 'ATIVO' } }),
      this.prisma.manutencao.count({ where: { status: { in: ['AGENDADA', 'EM_ANDAMENTO'] } } }),
      this.prisma.veiculo.aggregate({ _sum: { kmAtual: true } }),
    ]);

    return {
      success: true,
      data: {
        frotaTotal: totalVeiculos,
        veiculosAtivos,
        manutencoesPendentes,
        kmTotalFrota: kmTotal._sum.kmAtual || 0,
      },
    };
  }

  async custos() {
    const seisMesesAtras = new Date();
    seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6);

    const [abastecimentos, manutencoes] = await Promise.all([
      this.prisma.abastecimento.findMany({
        where: { data: { gte: seisMesesAtras } },
        select: { data: true, valorTotal: true },
        orderBy: { data: 'asc' },
      }),
      this.prisma.manutencao.findMany({
        where: { data: { gte: seisMesesAtras }, status: 'CONCLUIDA' },
        select: { data: true, valorTotal: true },
        orderBy: { data: 'asc' },
      }),
    ]);

    const custosPorMes: any = {};

    for (const item of abastecimentos) {
      const mes = `${item.data.getFullYear()}-${String(item.data.getMonth() + 1).padStart(2, '0')}`;
      if (!custosPorMes[mes]) custosPorMes[mes] = { mes, combustivel: 0, manutencao: 0 };
      custosPorMes[mes].combustivel += Number(item.valorTotal);
    }

    for (const item of manutencoes) {
      const mes = `${item.data.getFullYear()}-${String(item.data.getMonth() + 1).padStart(2, '0')}`;
      if (!custosPorMes[mes]) custosPorMes[mes] = { mes, combustivel: 0, manutencao: 0 };
      custosPorMes[mes].manutencao += Number(item.valorTotal);
    }

    const data = Object.values(custosPorMes).sort((a: any, b: any) => a.mes.localeCompare(b.mes));
    return { success: true, data };
  }

  async consumoMedio() {
    const veiculos = await this.prisma.veiculo.findMany({
      where: { situacao: 'ATIVO' },
      select: { id: true, placa: true, marca: true, modelo: true, kmAtual: true, combustivel: true },
    });

    const data = await Promise.all(
      veiculos.map(async (veiculo) => {
        const abastecimentos = await this.prisma.abastecimento.findMany({
          where: { veiculoId: veiculo.id },
          select: { litros: true, valorTotal: true, kmAtual: true },
          orderBy: { data: 'desc' },
          take: 10,
        });

        const totalLitros = abastecimentos.reduce((acc, a) => acc + Number(a.litros), 0);
        const totalGasto = abastecimentos.reduce((acc, a) => acc + Number(a.valorTotal), 0);
        const kmAtual = Number(veiculo.kmAtual);

        return {
          placa: veiculo.placa,
          veiculo: `${veiculo.marca} ${veiculo.modelo}`,
          combustivel: veiculo.combustivel,
          kmAtual,
          totalAbastecimentos: abastecimentos.length,
          totalLitros,
          totalGasto,
          mediaPrecoLitro: totalLitros > 0 ? totalGasto / totalLitros : 0,
        };
      }),
    );

    return { success: true, data };
  }
}
