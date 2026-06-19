import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import {
  CreateAvaliacaoDto, AvaliacaoQueryDto, ResponderAvaliacaoDto,
} from './dto/avaliacoes.dto';

@Injectable()
export class AvaliacoesService {
  private readonly logger = new Logger(AvaliacoesService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAvaliacaoDto) {
    const avaliacao = await this.prisma.avaliacaoCompetencia.create({
      data: {
        funcionarioId: dto.funcionarioId,
        avaliadorId: dto.avaliadorId,
        tipo: dto.tipo,
        periodoAvaliacao: dto.periodoAvaliacao,
        competencia: dto.competencia,
        nota: dto.nota || 1,
        feedback: dto.feedback,
        status: 'Pendente',
      },
    });

    this.logger.log(`Avaliação criada para funcionário ${dto.funcionarioId}`);
    return { success: true, data: avaliacao };
  }

  async findAll(query: AvaliacaoQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.funcionarioId) where.funcionarioId = query.funcionarioId;
    if (query.avaliadorId) where.avaliadorId = query.avaliadorId;
    if (query.status) where.status = query.status;
    if (query.tipo) where.tipo = query.tipo;

    const [data, total] = await Promise.all([
      this.prisma.avaliacaoCompetencia.findMany({
        where,
        skip,
        take: limit,
        orderBy: { data: 'desc' },
      }),
      this.prisma.avaliacaoCompetencia.count({ where }),
    ]);

    return {
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const avaliacao = await this.prisma.avaliacaoCompetencia.findUnique({ where: { id } });
    if (!avaliacao) throw new NotFoundException('Avaliação não encontrada');
    return { success: true, data: avaliacao };
  }

  async responder(id: string, dto: ResponderAvaliacaoDto) {
    const avaliacao = await this.prisma.avaliacaoCompetencia.findUnique({ where: { id } });
    if (!avaliacao) throw new NotFoundException('Avaliação não encontrada');
    if (avaliacao.status === 'Concluida') throw new BadRequestException('Avaliação já foi concluída');

    const updated = await this.prisma.avaliacaoCompetencia.update({
      where: { id },
      data: {
        nota: dto.nota,
        feedback: dto.feedback,
        status: 'Concluida',
      },
    });

    return { success: true, data: updated };
  }

  async relatorioFuncionario(funcionarioId: string) {
    const [habilidades, certificacoes, participacoes, avaliacoes] = await Promise.all([
      this.prisma.funcionarioHabilidade.findMany({
        where: { funcionarioId },
        include: { habilidade: true },
        orderBy: { habilidade: { categoria: 'asc' } },
      }),
      this.prisma.funcionarioCertificacao.findMany({
        where: { funcionarioId },
        include: { certificacao: true },
        orderBy: { dataValidade: 'desc' },
      }),
      this.prisma.participacaoTreinamento.findMany({
        where: { funcionarioId },
        include: { turma: { include: { treinamento: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.avaliacaoCompetencia.findMany({
        where: { funcionarioId },
        orderBy: { data: 'desc' },
      }),
    ]);

    const mediaAvaliacoes = avaliacoes.length
      ? avaliacoes.filter(a => a.status === 'Concluida').reduce((acc, a) => acc + a.nota, 0) / avaliacoes.filter(a => a.status === 'Concluida').length
      : 0;

    const mediaHabilidades = habilidades.length
      ? habilidades.reduce((acc, h) => acc + h.nivelAtual, 0) / habilidades.length
      : 0;

    return {
      success: true,
      data: {
        funcionarioId,
        resumo: {
          totalHabilidades: habilidades.length,
          totalCertificacoes: certificacoes.length,
          certificacoesValidas: certificacoes.filter(c => c.status === 'Valida').length,
          totalTreinamentos: participacoes.length,
          treinamentosAprovados: participacoes.filter(p => p.aprovado).length,
          totalAvaliacoes: avaliacoes.length,
          avaliacoesConcluidas: avaliacoes.filter(a => a.status === 'Concluida').length,
          mediaAvaliacoes,
          mediaHabilidades,
        },
        habilidades,
        certificacoes,
        treinamentos: participacoes,
        avaliacoes,
      },
    };
  }
}
