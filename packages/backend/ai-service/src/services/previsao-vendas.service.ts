import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

interface ForecastResult {
  produtoId: string;
  data: Date;
  quantidadePrevista: number;
  confianca: number;
  fatores: any[];
  geradaEm: Date;
}

@Injectable()
export class PrevisaoVendasService {
  private readonly logger = new Logger(PrevisaoVendasService.name);

  constructor(private readonly prisma: PrismaService) {}

  async forecast(produtoId: string, data: Date, fatores?: any[]): Promise<ForecastResult> {
    this.logger.log(`Generating forecast for product ${produtoId} on ${data.toISOString()}`);

    const historico = await this.prisma.previsaoVenda.findMany({
      where: { produtoId },
      orderBy: { data: 'desc' },
      take: 30,
    });

    const mediaHistorica = historico.length > 0
      ? historico.reduce((sum, h) => sum + h.quantidadePrevista, 0) / historico.length
      : 100;

    const tendencia = this.calcularTendencia(historico);
    const sazonalidade = this.calcularSazonalidade(data);
    const quantidadeBase = mediaHistorica * (1 + tendencia) * sazonalidade;
    const ruido = (Math.random() - 0.5) * 0.1;
    const quantidadePrevista = parseFloat((quantidadeBase * (1 + ruido)).toFixed(2));
    const confianca = parseFloat(Math.min(0.95, Math.max(0.5, 0.8 - historico.length * 0.005)).toFixed(2));

    return {
      produtoId,
      data,
      quantidadePrevista,
      confianca,
      fatores: fatores || [
        { nome: 'mediaHistorica', valor: parseFloat(mediaHistorica.toFixed(2)) },
        { nome: 'tendencia', valor: parseFloat(tendencia.toFixed(4)) },
        { nome: 'sazonalidade', valor: parseFloat(sazonalidade.toFixed(4)) },
        { nome: 'historicoRegistros', valor: historico.length },
      ],
      geradaEm: new Date(),
    };
  }

  private calcularTendencia(historico: any[]): number {
    if (historico.length < 2) return 0;
    const recentes = historico.slice(0, Math.min(10, historico.length));
    const antigos = historico.slice(recentes.length);
    if (antigos.length === 0) return 0;
    const mediaRecente = recentes.reduce((s, h) => s + h.quantidadePrevista, 0) / recentes.length;
    const mediaAntiga = antigos.reduce((s, h) => s + h.quantidadePrevista, 0) / antigos.length;
    return mediaAntiga > 0 ? (mediaRecente - mediaAntiga) / mediaAntiga : 0;
  }

  private calcularSazonalidade(data: Date): number {
    const mes = data.getMonth();
    const fatoresSazonais = [0.9, 0.85, 0.95, 1.0, 1.05, 1.1, 1.15, 1.1, 1.05, 1.0, 0.95, 1.2];
    return fatoresSazonais[mes] || 1.0;
  }
}
