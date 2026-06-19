import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateTreinamentoDto, UpdateTreinamentoDto, TreinamentoQueryDto, VincularFuncionarioDto, UpdateVinculoDto } from './dto/create-treinamento.dto';

@Injectable()
export class TreinamentoService {
  private readonly logger = new Logger(TreinamentoService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTreinamentoDto) {
    const treinamento = await this.prisma.treinamento.create({
      data: {
        nome: dto.nome,
        descricao: dto.descricao,
        dataInicio: new Date(dto.dataInicio),
        dataFim: new Date(dto.dataFim),
        cargaHoraria: dto.cargaHoraria,
        instrutor: dto.instrutor,
        status: dto.status || 'AGENDADO',
      },
    });

    this.logger.log(`Treinamento criado: ${treinamento.nome}`);
    return { success: true, data: treinamento };
  }

  async findAll(query: TreinamentoQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.nome) where.nome = { contains: query.nome, mode: 'insensitive' };
    if (query.instrutor) where.instrutor = { contains: query.instrutor, mode: 'insensitive' };
    if (query.status) where.status = query.status;

    const [data, total] = await Promise.all([
      this.prisma.treinamento.findMany({
        where,
        skip,
        take: limit,
        orderBy: { dataInicio: 'desc' },
        include: { _count: { select: { funcionarios: true } } },
      }),
      this.prisma.treinamento.count({ where }),
    ]);

    return {
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const treinamento = await this.prisma.treinamento.findUnique({
      where: { id },
      include: {
        funcionarios: {
          include: { funcionario: { select: { id: true, nome: true, matricula: true } } },
        },
      },
    });
    if (!treinamento) throw new NotFoundException('Treinamento não encontrado');
    return { success: true, data: treinamento };
  }

  async update(id: string, dto: UpdateTreinamentoDto) {
    await this.findOne(id);
    const data: any = { ...dto };
    if (dto.dataInicio) data.dataInicio = new Date(dto.dataInicio);
    if (dto.dataFim) data.dataFim = new Date(dto.dataFim);

    const updated = await this.prisma.treinamento.update({ where: { id }, data });
    return { success: true, data: updated };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.treinamentoFuncionario.deleteMany({ where: { treinamentoId: id } });
    await this.prisma.treinamento.delete({ where: { id } });
    return { success: true, message: 'Treinamento removido' };
  }

  async vincularFuncionario(dto: VincularFuncionarioDto) {
    const [treinamento, funcionario] = await Promise.all([
      this.prisma.treinamento.findUnique({ where: { id: dto.treinamentoId } }),
      this.prisma.funcionario.findUnique({ where: { id: dto.funcionarioId } }),
    ]);
    if (!treinamento) throw new NotFoundException('Treinamento não encontrado');
    if (!funcionario) throw new NotFoundException('Funcionário não encontrado');

    const existente = await this.prisma.treinamentoFuncionario.findUnique({
      where: {
        treinamentoId_funcionarioId: {
          treinamentoId: dto.treinamentoId,
          funcionarioId: dto.funcionarioId,
        },
      },
    });
    if (existente) throw new ConflictException('Funcionário já vinculado ao treinamento');

    const vinculo = await this.prisma.treinamentoFuncionario.create({
      data: {
        treinamentoId: dto.treinamentoId,
        funcionarioId: dto.funcionarioId,
        status: dto.status || 'INSCRITO',
      },
      include: {
        treinamento: true,
        funcionario: { select: { id: true, nome: true, matricula: true } },
      },
    });

    return { success: true, data: vinculo };
  }

  async updateVinculo(id: string, dto: UpdateVinculoDto) {
    const vinculo = await this.prisma.treinamentoFuncionario.findUnique({ where: { id } });
    if (!vinculo) throw new NotFoundException('Vínculo não encontrado');

    const updated = await this.prisma.treinamentoFuncionario.update({
      where: { id },
      data: {
        ...dto,
        nota: dto.nota,
      },
      include: {
        treinamento: true,
        funcionario: { select: { id: true, nome: true, matricula: true } },
      },
    });

    return { success: true, data: updated };
  }

  async desvincularFuncionario(id: string) {
    const vinculo = await this.prisma.treinamentoFuncionario.findUnique({ where: { id } });
    if (!vinculo) throw new NotFoundException('Vínculo não encontrado');

    await this.prisma.treinamentoFuncionario.delete({ where: { id } });
    return { success: true, message: 'Funcionário desvinculado do treinamento' };
  }

  async listarPorFuncionario(funcionarioId: string) {
    const vinculos = await this.prisma.treinamentoFuncionario.findMany({
      where: { funcionarioId },
      include: { treinamento: true },
      orderBy: { treinamento: { dataInicio: 'desc' } },
    });
    return { success: true, data: vinculos };
  }
}
