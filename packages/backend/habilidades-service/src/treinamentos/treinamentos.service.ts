import { Injectable, NotFoundException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import {
  CreateTreinamentoDto, UpdateTreinamentoDto, TreinamentoQueryDto,
  CreateTurmaDto, UpdateTurmaDto, InscreverFuncionarioDto, RegistrarPresencaDto,
} from './dto/treinamentos.dto';

@Injectable()
export class TreinamentosService {
  private readonly logger = new Logger(TreinamentosService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTreinamentoDto) {
    const treinamento = await this.prisma.treinamento.create({ data: dto });
    this.logger.log(`Treinamento criado: ${treinamento.nome}`);
    return { success: true, data: treinamento };
  }

  async findAll(query: TreinamentoQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.nome) where.nome = { contains: query.nome, mode: 'insensitive' };
    if (query.modalidade) where.modalidade = query.modalidade;

    const [data, total] = await Promise.all([
      this.prisma.treinamento.findMany({
        where,
        skip,
        take: limit,
        orderBy: { nome: 'asc' },
        include: { _count: { select: { turmas: true } } },
      }),
      this.prisma.treinamento.count({ where }),
    ]);

    return {
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async relatorio() {
    const [totalTreinamentos, totalTurmas, totalParticipacoes, aprovacoes, maisPopulares] = await Promise.all([
      this.prisma.treinamento.count(),
      this.prisma.turmaTreinamento.count(),
      this.prisma.participacaoTreinamento.count(),
      this.prisma.participacaoTreinamento.aggregate({ _avg: { nota: true } }),
      this.prisma.treinamento.findMany({
        take: 5,
        orderBy: { turmas: { _count: 'desc' } },
        include: { _count: { select: { turmas: true } } },
      }),
    ]);

    const participantesPorTurma = await this.prisma.participacaoTreinamento.groupBy({
      by: ['aprovado'],
      _count: { id: true },
    });

    const aprovados = participantesPorTurma.find(p => p.aprovado)?._count?.id || 0;
    const reprovados = participantesPorTurma.find(p => !p.aprovado)?._count?.id || 0;

    return {
      success: true,
      data: {
        totalTreinamentos,
        totalTurmas,
        totalParticipacoes,
        mediaNota: aprovacoes._avg.nota || 0,
        aprovados,
        reprovados,
        maisPopulares,
      },
    };
  }

  async findOne(id: string) {
    const treinamento = await this.prisma.treinamento.findUnique({
      where: { id },
      include: {
        turmas: {
          include: { _count: { select: { participantes: true } } },
          orderBy: { dataInicio: 'desc' },
        },
      },
    });
    if (!treinamento) throw new NotFoundException('Treinamento não encontrado');
    return { success: true, data: treinamento };
  }

  async update(id: string, dto: UpdateTreinamentoDto) {
    await this.findOne(id);
    const updated = await this.prisma.treinamento.update({ where: { id }, data: dto });
    return { success: true, data: updated };
  }

  async remove(id: string) {
    await this.findOne(id);
    const turmas = await this.prisma.turmaTreinamento.findMany({ where: { treinamentoId: id }, select: { id: true } });
    const turmaIds = turmas.map(t => t.id);
    await this.prisma.participacaoTreinamento.deleteMany({ where: { turmaId: { in: turmaIds } } });
    await this.prisma.turmaTreinamento.deleteMany({ where: { treinamentoId: id } });
    await this.prisma.treinamento.delete({ where: { id } });
    return { success: true, message: 'Treinamento removido' };
  }

  async criarTurma(treinamentoId: string, dto: CreateTurmaDto) {
    const treinamento = await this.prisma.treinamento.findUnique({ where: { id: treinamentoId } });
    if (!treinamento) throw new NotFoundException('Treinamento não encontrado');

    const turma = await this.prisma.turmaTreinamento.create({
      data: {
        treinamentoId,
        codigo: dto.codigo,
        dataInicio: new Date(dto.dataInicio),
        dataFim: dto.dataFim ? new Date(dto.dataFim) : null,
        horario: dto.horario,
        instrutor: dto.instrutor,
        local: dto.local,
        vagas: dto.vagas || 0,
        vagasPreenchidas: 0,
        observacoes: dto.observacoes,
      },
      include: { treinamento: true },
    });

    return { success: true, data: turma };
  }

  async listarTurmas(treinamentoId: string) {
    await this.findOne(treinamentoId);
    const turmas = await this.prisma.turmaTreinamento.findMany({
      where: { treinamentoId },
      include: { _count: { select: { participantes: true } } },
      orderBy: { dataInicio: 'desc' },
    });
    return { success: true, data: turmas };
  }

  async findTurma(id: string) {
    const turma = await this.prisma.turmaTreinamento.findUnique({
      where: { id },
      include: {
        treinamento: true,
        participantes: {
          include: { turma: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!turma) throw new NotFoundException('Turma não encontrada');
    return { success: true, data: turma };
  }

  async updateTurma(id: string, dto: UpdateTurmaDto) {
    await this.findTurma(id);
    const data: any = { ...dto };
    if (dto.dataInicio) data.dataInicio = new Date(dto.dataInicio);
    if (dto.dataFim) data.dataFim = new Date(dto.dataFim);

    const updated = await this.prisma.turmaTreinamento.update({ where: { id }, data });
    return { success: true, data: updated };
  }

  async inscrever(turmaId: string, dto: InscreverFuncionarioDto) {
    const turma = await this.prisma.turmaTreinamento.findUnique({ where: { id: turmaId } });
    if (!turma) throw new NotFoundException('Turma não encontrada');

    if (turma.vagas > 0 && turma.vagasPreenchidas >= turma.vagas) {
      throw new BadRequestException('Turma sem vagas disponíveis');
    }

    const existente = await this.prisma.participacaoTreinamento.findUnique({
      where: { turmaId_funcionarioId: { turmaId, funcionarioId: dto.funcionarioId } },
    });
    if (existente) throw new ConflictException('Funcionário já inscrito nesta turma');

    const participacao = await this.prisma.participacaoTreinamento.create({
      data: {
        turmaId,
        funcionarioId: dto.funcionarioId,
        frequencia: dto.frequencia || 0,
      },
      include: { turma: true },
    });

    await this.prisma.turmaTreinamento.update({
      where: { id: turmaId },
      data: { vagasPreenchidas: turma.vagasPreenchidas + 1 },
    });

    return { success: true, data: participacao };
  }

  async registrarPresenca(turmaId: string, dto: RegistrarPresencaDto) {
    const participacao = await this.prisma.participacaoTreinamento.findUnique({
      where: { turmaId_funcionarioId: { turmaId, funcionarioId: dto.funcionarioId } },
    });
    if (!participacao) throw new NotFoundException('Funcionário não inscrito nesta turma');

    const updated = await this.prisma.participacaoTreinamento.update({
      where: { id: participacao.id },
      data: { frequencia: dto.frequencia },
    });

    return { success: true, data: updated };
  }

  async concluirTurma(turmaId: string) {
    const turma = await this.prisma.turmaTreinamento.findUnique({
      where: { id: turmaId },
      include: { participantes: true },
    });
    if (!turma) throw new NotFoundException('Turma não encontrada');

    for (const participante of turma.participantes) {
      const freq = Number(participante.frequencia);
      await this.prisma.participacaoTreinamento.update({
        where: { id: participante.id },
        data: {
          aprovado: freq >= 75,
          certificadoEmitido: freq >= 75,
        },
      });
    }

    const updated = await this.prisma.turmaTreinamento.update({
      where: { id: turmaId },
      data: {
        status: 'Concluida',
        dataFim: new Date(),
      },
      include: { participantes: true },
    });

    return { success: true, data: updated };
  }
}
