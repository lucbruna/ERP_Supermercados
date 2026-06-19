import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class ReportGeneratorService {
  private readonly logger = new Logger(ReportGeneratorService.name);

  constructor(private readonly prisma: PrismaService) {}

  async generate(relatorio: any, filtros?: string[]): Promise<any[]> {
    this.logger.log(`Generating report: ${relatorio.nome}, type: ${relatorio.tipo}`);

    const dados: any[] = [];
    const params = relatorio.parametros || {};

    dados.push({
      geradoEm: new Date().toISOString(),
      tipo: relatorio.tipo,
      filtros: filtros || [],
      registros: Math.floor(Math.random() * 1000) + 50,
      resumo: {
        total: Math.random() * 500000,
        media: Math.random() * 1000,
        minimo: Math.random() * 100,
        maximo: Math.random() * 10000 + 1000,
      },
      linhas: Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        descricao: `Item ${i + 1}`,
        valor: Math.random() * 10000,
        data: new Date(Date.now() - i * 86400000).toISOString(),
      })),
    });

    return dados;
  }

  async generateFromFilters(companyId: string, params: any, filtros?: string[]): Promise<any[]> {
    this.logger.log(`Generating ad-hoc report for company ${companyId}`);

    const kpis = await this.prisma.dashboardKPI.findMany({
      where: { companyId },
      take: 50,
    });

    return [{
      geradoEm: new Date().toISOString(),
      companyId,
      params: params || {},
      filtros: filtros || [],
      kpis: kpis.map(k => ({
        nome: k.nome,
        categoria: k.categoria,
        valor: k.valor,
        meta: k.meta,
        variacao: k.variacao,
      })),
      totalRegistros: kpis.length,
    }];
  }
}
