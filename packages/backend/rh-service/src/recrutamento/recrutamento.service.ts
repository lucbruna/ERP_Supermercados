import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateRecrutamentoDto, UpdateRecrutamentoDto, RecrutamentoQueryDto, CreateCandidatoDto, UpdateCandidatoDto } from './dto/create-recrutamento.dto';

@Injectable()
export class RecrutamentoService {
  private readonly logger = new Logger(RecrutamentoService.name);

  constructor(private prisma: PrismaService) {}

  async createRecrutamento(dto: CreateRecrutamentoDto) {
    const recrutamento = await this.prisma.recrutamento.create({
      data: {
        ...dto,
        dataAbertura: dto.dataAbertura ? new Date(dto.dataAbertura) : new Date(),
      },
    });

    this.logger.log(`Recrutamento criado: ${recrutamento.cargo} - ${recrutamento.departamento}`);
    return { success: true, data: recrutamento };
  }

  async findAllRecrutamentos(query: RecrutamentoQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.cargo) where.cargo = { contains: query.cargo, mode: 'insensitive' };
    if (query.departamento) where.departamento = query.departamento;
    if (query.status) where.status = query.status;

    const [data, total] = await Promise.all([
      this.prisma.recrutamento.findMany({
        where,
        skip,
        take: limit,
        orderBy: { dataAbertura: 'desc' },
        include: { _count: { select: { candidatos: true } } },
      }),
      this.prisma.recrutamento.count({ where }),
    ]);

    return {
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOneRecrutamento(id: string) {
    const recrutamento = await this.prisma.recrutamento.findUnique({
      where: { id },
      include: {
        candidatos: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!recrutamento) throw new NotFoundException('Recrutamento não encontrado');
    return { success: true, data: recrutamento };
  }

  async updateRecrutamento(id: string, dto: UpdateRecrutamentoDto) {
    await this.findOneRecrutamento(id);

    const data: any = { ...dto };
    if (dto.status === 'FECHADA' || dto.status === 'CANCELADA') {
      data.dataFechamento = new Date();
    }

    const updated = await this.prisma.recrutamento.update({ where: { id }, data });
    return { success: true, data: updated };
  }

  async fecharRecrutamento(id: string) {
    const recrutamento = await this.prisma.recrutamento.findUnique({ where: { id } });
    if (!recrutamento) throw new NotFoundException('Recrutamento não encontrado');
    if (recrutamento.status === 'FECHADA' || recrutamento.status === 'CANCELADA') {
      throw new ConflictException('Recrutamento já finalizado');
    }

    const updated = await this.prisma.recrutamento.update({
      where: { id },
      data: { status: 'FECHADA', dataFechamento: new Date() },
    });
    return { success: true, data: updated };
  }

  async removeRecrutamento(id: string) {
    await this.findOneRecrutamento(id);
    await this.prisma.candidato.deleteMany({ where: { recrutamentoId: id } });
    await this.prisma.recrutamento.delete({ where: { id } });
    return { success: true, message: 'Recrutamento removido' };
  }

  async createCandidato(dto: CreateCandidatoDto) {
    const recrutamento = await this.prisma.recrutamento.findUnique({
      where: { id: dto.recrutamentoId },
    });
    if (!recrutamento) throw new NotFoundException('Recrutamento não encontrado');
    if (recrutamento.status === 'FECHADA' || recrutamento.status === 'CANCELADA') {
      throw new ConflictException('Recrutamento encerrado, não aceita novos candidatos');
    }

    const emailExist = await this.prisma.candidato.findUnique({
      where: { email: dto.email },
    });
    if (emailExist) throw new ConflictException('Email de candidato já cadastrado');

    const candidato = await this.prisma.candidato.create({
      data: {
        recrutamentoId: dto.recrutamentoId,
        nome: dto.nome,
        email: dto.email,
        celular: dto.celular,
        curriculoUrl: dto.curriculoUrl,
        status: dto.status || 'RECEBIDO',
        etapas: dto.etapas || [],
      },
    });

    this.logger.log(`Candidato cadastrado: ${candidato.nome} para ${recrutamento.cargo}`);
    return { success: true, data: candidato };
  }

  async findAllCandidatos(recrutamentoId: string, query: { page?: number; limit?: number }) {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = (page - 1) * limit;

    const where = { recrutamentoId };

    const [data, total] = await Promise.all([
      this.prisma.candidato.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.candidato.count({ where }),
    ]);

    return {
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOneCandidato(id: string) {
    const candidato = await this.prisma.candidato.findUnique({
      where: { id },
      include: { recrutamento: true },
    });
    if (!candidato) throw new NotFoundException('Candidato não encontrado');
    return { success: true, data: candidato };
  }

  async updateCandidato(id: string, dto: UpdateCandidatoDto) {
    await this.findOneCandidato(id);
    const updated = await this.prisma.candidato.update({ where: { id }, data: dto });
    return { success: true, data: updated };
  }

  async avancarEtapaCandidato(id: string, etapa: string) {
    const candidato = await this.prisma.candidato.findUnique({ where: { id } });
    if (!candidato) throw new NotFoundException('Candidato não encontrado');

    const etapas = [...(candidato.etapas as any[] || []), { etapa, data: new Date().toISOString() }];
    const updated = await this.prisma.candidato.update({
      where: { id },
      data: { etapas },
    });
    return { success: true, data: updated };
  }

  async removeCandidato(id: string) {
    await this.findOneCandidato(id);
    await this.prisma.candidato.delete({ where: { id } });
    return { success: true, message: 'Candidato removido' };
  }
}
