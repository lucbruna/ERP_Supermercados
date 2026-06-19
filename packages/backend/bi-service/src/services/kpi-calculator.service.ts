import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

export interface KpiResult {
  nome: string;
  categoria: string;
  valor: number;
  meta: number;
  variacao: number;
  periodo: string;
}

@Injectable()
export class KpiCalculatorService {
  private readonly logger = new Logger(KpiCalculatorService.name);

  constructor(private readonly prisma: PrismaService) {}

  async calculateAll(companyId: string, categoria?: string): Promise<KpiResult[]> {
    this.logger.log(`Calculating KPIs for company ${companyId}, category: ${categoria || 'all'}`);

    const results: KpiResult[] = [];
    const categories = categoria ? [categoria] : ['VENDAS', 'FINANCEIRO', 'ESTOQUE', 'RH', 'OPERACIONAL'];

    for (const cat of categories) {
      const kpis = await this.calculateByCategory(companyId, cat);
      results.push(...kpis);
    }

    for (const kpi of results) {
      await this.prisma.dashboardKPI.create({
        data: {
          companyId,
          nome: kpi.nome,
          categoria: kpi.categoria as any,
          valor: kpi.valor,
          meta: kpi.meta,
          variacao: kpi.variacao,
          periodo: kpi.periodo as any,
          dataReferencia: new Date(),
        },
      });
    }

    return results;
  }

  private async calculateByCategory(companyId: string, categoria: string): Promise<KpiResult[]> {
    const kpis: KpiResult[] = [];

    switch (categoria) {
      case 'VENDAS':
        kpis.push({
          nome: 'Faturamento Total',
          categoria: 'VENDAS',
          valor: Math.random() * 1000000,
          meta: 800000,
          variacao: parseFloat(((Math.random() * 20 - 5) / 100).toFixed(4)),
          periodo: 'MENSAL',
        });
        kpis.push({
          nome: 'Ticket Médio',
          categoria: 'VENDAS',
          valor: 150 + Math.random() * 50,
          meta: 180,
          variacao: parseFloat(((Math.random() * 10 - 5) / 100).toFixed(4)),
          periodo: 'DIARIO',
        });
        break;

      case 'FINANCEIRO':
        kpis.push({
          nome: 'Margem Líquida',
          categoria: 'FINANCEIRO',
          valor: 15 + Math.random() * 5,
          meta: 18,
          variacao: parseFloat(((Math.random() * 10 - 3) / 100).toFixed(4)),
          periodo: 'MENSAL',
        });
        kpis.push({
          nome: 'Inadimplência',
          categoria: 'FINANCEIRO',
          valor: 3 + Math.random() * 2,
          meta: 2.5,
          variacao: parseFloat(((Math.random() * 10) / 100).toFixed(4)),
          periodo: 'MENSAL',
        });
        break;

      case 'ESTOQUE':
        kpis.push({
          nome: 'Giro de Estoque',
          categoria: 'ESTOQUE',
          valor: 6 + Math.random() * 4,
          meta: 8,
          variacao: parseFloat(((Math.random() * 10 - 5) / 100).toFixed(4)),
          periodo: 'MENSAL',
        });
        kpis.push({
          nome: 'Cobertura de Estoque (dias)',
          categoria: 'ESTOQUE',
          valor: 25 + Math.random() * 10,
          meta: 30,
          variacao: parseFloat(((Math.random() * 8 - 4) / 100).toFixed(4)),
          periodo: 'DIARIO',
        });
        break;

      case 'RH':
        kpis.push({
          nome: 'Produtividade',
          categoria: 'RH',
          valor: 85 + Math.random() * 10,
          meta: 90,
          variacao: parseFloat(((Math.random() * 6 - 2) / 100).toFixed(4)),
          periodo: 'MENSAL',
        });
        kpis.push({
          nome: 'Absenteísmo',
          categoria: 'RH',
          valor: 3 + Math.random() * 2,
          meta: 2,
          variacao: parseFloat(((Math.random() * 15) / 100).toFixed(4)),
          periodo: 'MENSAL',
        });
        break;

      case 'OPERACIONAL':
        kpis.push({
          nome: 'Precisão de Separação',
          categoria: 'OPERACIONAL',
          valor: 95 + Math.random() * 4,
          meta: 98,
          variacao: parseFloat(((Math.random() * 4 - 1) / 100).toFixed(4)),
          periodo: 'DIARIO',
        });
        kpis.push({
          nome: 'Entregas no Prazo',
          categoria: 'OPERACIONAL',
          valor: 90 + Math.random() * 8,
          meta: 95,
          variacao: parseFloat(((Math.random() * 5 - 1) / 100).toFixed(4)),
          periodo: 'SEMANAL',
        });
        break;
    }

    return kpis;
  }
}
