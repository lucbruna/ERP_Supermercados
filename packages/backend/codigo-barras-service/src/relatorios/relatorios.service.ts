import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class RelatoriosService {
  private readonly logger = new Logger(RelatoriosService.name);

  constructor(private prisma: PrismaService) {}

  async resumo() {
    const totalProdutos = await this.prisma.codigoBarras.groupBy({
      by: ['produtoId'],
      _count: { id: true },
      where: { status: 'Ativo' },
    });

    const produtosComCodigo = totalProdutos.length;
    const codigosAtivos = totalProdutos.reduce((sum, g) => sum + g._count.id, 0);
    const codigosInativos = await this.prisma.codigoBarras.count({ where: { status: 'Inativo' } });

    const tipos = await this.prisma.codigoBarras.groupBy({
      by: ['tipo'],
      _count: { id: true },
    });

    const distribuicaoTipos = tipos.map(t => ({ tipo: t.tipo, quantidade: t._count.id }));

    return {
      success: true,
      data: {
        produtosComCodigo,
        codigosAtivos,
        codigosInativos,
        totalCodigos: codigosAtivos + codigosInativos,
        distribuicaoTipos,
      },
    };
  }

  async etiquetas() {
    const totalEtiquetas = await this.prisma.etiqueta.count();

    const impressoes = await this.prisma.impressaoEtiqueta.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    const impressoesPorStatus = impressoes.map(i => ({ status: i.status, quantidade: i._count.id }));

    const etiquetasMaisUsadas = await this.prisma.impressaoEtiqueta.groupBy({
      by: ['etiquetaId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });

    const etiquetasDetalhes = await Promise.all(
      etiquetasMaisUsadas.map(async (e) => {
        const etiqueta = await this.prisma.etiqueta.findUnique({ where: { id: e.etiquetaId } });
        return {
          etiquetaId: e.etiquetaId,
          nome: etiqueta?.nome || 'Desconhecida',
                        totalImpressoes: e._count.id,
        };
      }),
    );

    const totalImpressoes = await this.prisma.impressaoEtiqueta.count();

    return {
      success: true,
      data: {
        totalEtiquetas,
        totalImpressoes,
        impressoesPorStatus,
        etiquetasMaisUsadas: etiquetasDetalhes,
      },
    };
  }
}
