import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import {
  CreateHabilidadeDto, UpdateHabilidadeDto, HabilidadeQueryDto,
  VincularHabilidadeDto, AtualizarNivelHabilidadeDto,
} from './dto/habilidades.dto';

@Injectable()
export class HabilidadesService {
  private readonly logger = new Logger(HabilidadesService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateHabilidadeDto) {
    const habilidade = await this.prisma.habilidade.create({ data: dto });
    this.logger.log(`Habilidade criada: ${habilidade.nome}`);
    return { success: true, data: habilidade };
  }

  async findAll(query: HabilidadeQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.categoria) where.categoria = query.categoria;
    if (query.nome) where.nome = { contains: query.nome, mode: 'insensitive' };

    const [data, total] = await Promise.all([
      this.prisma.habilidade.findMany({
        where,
        skip,
        take: limit,
        orderBy: { nome: 'asc' },
        include: { _count: { select: { funcionarios: true } } },
      }),
      this.prisma.habilidade.count({ where }),
    ]);

    return {
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const habilidade = await this.prisma.habilidade.findUnique({
      where: { id },
      include: {
        funcionarios: {
          include: { habilidade: true },
          orderBy: { dataAquisicao: 'desc' },
        },
      },
    });
    if (!habilidade) throw new NotFoundException('Habilidade não encontrada');
    return { success: true, data: habilidade };
  }

  async update(id: string, dto: UpdateHabilidadeDto) {
    await this.findOne(id);
    const updated = await this.prisma.habilidade.update({ where: { id }, data: dto });
    return { success: true, data: updated };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.funcionarioHabilidade.deleteMany({ where: { habilidadeId: id } });
    await this.prisma.habilidade.delete({ where: { id } });
    return { success: true, message: 'Habilidade removida' };
  }

  async vincularFuncionario(id: string, dto: VincularHabilidadeDto) {
    const habilidade = await this.prisma.habilidade.findUnique({ where: { id } });
    if (!habilidade) throw new NotFoundException('Habilidade não encontrada');

    const existente = await this.prisma.funcionarioHabilidade.findUnique({
      where: { funcionarioId_habilidadeId: { funcionarioId: dto.funcionarioId, habilidadeId: id } },
    });
    if (existente) throw new ConflictException('Funcionário já possui esta habilidade');

    const vinculo = await this.prisma.funcionarioHabilidade.create({
      data: {
        funcionarioId: dto.funcionarioId,
        habilidadeId: id,
        nivelAtual: dto.nivelAtual || 1,
        observacoes: dto.observacoes,
      },
      include: { habilidade: true },
    });

    return { success: true, data: vinculo };
  }

  async atualizarNivel(id: string, funcionarioId: string, dto: AtualizarNivelHabilidadeDto) {
    const vinculo = await this.prisma.funcionarioHabilidade.findUnique({
      where: { funcionarioId_habilidadeId: { funcionarioId, habilidadeId: id } },
    });
    if (!vinculo) throw new NotFoundException('Vínculo não encontrado');

    const updated = await this.prisma.funcionarioHabilidade.update({
      where: { id: vinculo.id },
      data: {
        nivelAtual: dto.nivelAtual,
        dataUltimaAtualizacao: new Date(),
        observacoes: dto.observacoes,
      },
    });

    return { success: true, data: updated };
  }

  async desvincularFuncionario(id: string, funcionarioId: string) {
    const vinculo = await this.prisma.funcionarioHabilidade.findUnique({
      where: { funcionarioId_habilidadeId: { funcionarioId, habilidadeId: id } },
    });
    if (!vinculo) throw new NotFoundException('Vínculo não encontrado');

    await this.prisma.funcionarioHabilidade.delete({ where: { id: vinculo.id } });
    return { success: true, message: 'Habilidade desvinculada do funcionário' };
  }
}
