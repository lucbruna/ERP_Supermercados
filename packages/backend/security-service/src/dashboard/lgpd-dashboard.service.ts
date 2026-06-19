import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class LgpdDashboardService {
  constructor(private prisma: PrismaService) {}

  async getResumo() {
    const [totalConsentimentos, solicitacoesPendentes, titulares] = await Promise.all([
      this.prisma.consentimentoLGPD.count({ where: { concedido: true } }),
      this.prisma.solicitacaoTitular.count({
        where: { status: { in: ['PENDENTE', 'EM_ANDAMENTO'] } },
      }),
      this.prisma.$queryRawUnsafe<{ count: bigint }[]>(
        `SELECT COUNT(DISTINCT usuario_id) as count FROM (
          SELECT usuario_id FROM consentimentos_lgpd
          UNION
          SELECT usuario_id FROM solicitacoes_titular
          UNION
          SELECT usuario_id FROM dados_pessoais
        ) as titulares`,
      ),
    ]);

    return {
      success: true,
      data: {
        totalConsentimentos,
        solicitacoesPendentes,
        totalTitulares: Number(titulares[0]?.count || 0),
      },
    };
  }

  async getSolicitacoesPorMes() {
    const result = await this.prisma.$queryRawUnsafe<
      { mes: string; total: bigint }[]
    >(
      `SELECT TO_CHAR(criado_em, 'YYYY-MM') as mes, COUNT(*) as total
       FROM solicitacoes_titular
       GROUP BY mes
       ORDER BY mes`,
    );

    return {
      success: true,
      data: result.map((r) => ({ mes: r.mes, total: Number(r.total) })),
    };
  }

  async getTiposDados() {
    const result = await this.prisma.dadosPessoais.groupBy({
      by: ['tipo'],
      _count: true,
    });

    return {
      success: true,
      data: result.map((r) => ({ tipo: r.tipo, total: r._count })),
    };
  }
}
