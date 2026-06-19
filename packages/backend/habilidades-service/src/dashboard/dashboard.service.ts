import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private prisma: PrismaService) {}

  async resumo() {
    const [
      totalHabilidades,
      totalFuncionariosHabilidade,
      totalCertificacoes,
      totalFuncionariosCertificacao,
      totalTreinamentos,
      totalTurmas,
      totalParticipacoes,
      totalAvaliacoes,
      avaliacoesConcluidas,
      certificacoesVencendo,
    ] = await Promise.all([
      this.prisma.habilidade.count(),
      this.prisma.funcionarioHabilidade.count(),
      this.prisma.certificacao.count(),
      this.prisma.funcionarioCertificacao.count(),
      this.prisma.treinamento.count(),
      this.prisma.turmaTreinamento.count(),
      this.prisma.participacaoTreinamento.count(),
      this.prisma.avaliacaoCompetencia.count(),
      this.prisma.avaliacaoCompetencia.count({ where: { status: 'Concluida' } }),
      this.prisma.funcionarioCertificacao.count({
        where: {
          status: 'Valida',
          dataValidade: {
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    return {
      success: true,
      data: {
        habilidades: { totalCatalogo: totalHabilidades, totalVinculos: totalFuncionariosHabilidade },
        certificacoes: { totalCatalogo: totalCertificacoes, totalConcedidas: totalFuncionariosCertificacao, vencendoProximos30Dias: certificacoesVencendo },
        treinamentos: { totalCatalogo: totalTreinamentos, totalTurmas, totalParticipacoes },
        avaliacoes: { total: totalAvaliacoes, concluidas: avaliacoesConcluidas, pendentes: totalAvaliacoes - avaliacoesConcluidas },
      },
    };
  }

  async competencias() {
    const habilidades = await this.prisma.habilidade.findMany({
      include: { _count: { select: { funcionarios: true } } },
      orderBy: { funcionarios: { _count: 'desc' } },
    });

    const maisComuns = habilidades.filter(h => h._count.funcionarios > 0).slice(0, 5);
    const menosComuns = [...habilidades].sort((a, b) => a._count.funcionarios - b._count.funcionarios).slice(0, 5);

    const porCategoria = await this.prisma.funcionarioHabilidade.groupBy({
      by: ['habilidadeId'],
      _count: { id: true },
    });

    const categorias = await this.prisma.habilidade.groupBy({
      by: ['categoria'],
      _count: { id: true },
    });

    return {
      success: true,
      data: {
        maisComuns,
        menosComuns,
        distribuicaoCategoria: categorias,
        totalVinculos: porCategoria.reduce((acc, c) => acc + c._count.id, 0),
      },
    };
  }

  async perfilFuncionario(id: string) {
    const habilidades = await this.prisma.funcionarioHabilidade.findMany({
      where: { funcionarioId: id },
      include: { habilidade: true },
      orderBy: { nivelAtual: 'desc' },
    });

    const certificacoes = await this.prisma.funcionarioCertificacao.findMany({
      where: { funcionarioId: id },
      include: { certificacao: true },
      orderBy: { dataValidade: 'desc' },
    });

    const participacoes = await this.prisma.participacaoTreinamento.findMany({
      where: { funcionarioId: id },
      include: { turma: { include: { treinamento: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const avaliacoes = await this.prisma.avaliacaoCompetencia.findMany({
      where: { funcionarioId: id },
      orderBy: { data: 'desc' },
    });

    if (!habilidades.length && !certificacoes.length && !participacoes.length && !avaliacoes.length) {
      throw new NotFoundException('Nenhum dado de competência encontrado para este funcionário');
    }

    const totalAvaliacoes = avaliacoes.length;
    const concluidas = avaliacoes.filter(a => a.status === 'Concluida');
    const mediaGeral = concluidas.length
      ? concluidas.reduce((acc, a) => acc + a.nota, 0) / concluidas.length
      : 0;

    const mediaHabilidades = habilidades.length
      ? habilidades.reduce((acc, h) => acc + h.nivelAtual, 0) / habilidades.length
      : 0;

    const certificacoesValidas = certificacoes.filter(c => c.status === 'Valida').length;
    const aprovacoes = participacoes.filter(p => p.aprovado).length;

    return {
      success: true,
      data: {
        funcionarioId: id,
        indicadores: {
          mediaHabilidades,
          totalHabilidades: habilidades.length,
          certificacoesValidas,
          totalCertificacoes: certificacoes.length,
          treinamentosAprovados: aprovacoes,
          totalTreinamentos: participacoes.length,
          mediaAvaliacoes: mediaGeral,
          totalAvaliacoes,
          avaliacoesConcluidas: concluidas.length,
        },
        habilidades,
        certificacoes,
        treinamentos: participacoes,
        avaliacoes,
      },
    };
  }
}
