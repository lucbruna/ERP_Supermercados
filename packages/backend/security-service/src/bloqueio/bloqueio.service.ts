import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CriarBloqueioDto, AtualizarBloqueioDto } from './dto/bloqueio.dto';

@Injectable()
export class BloqueioService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { page?: number; limit?: number; ativo?: boolean; ip?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.ativo !== undefined) where.ativo = query.ativo;
    if (query.ip) where.ip = { contains: query.ip };

    const [bloqueios, total] = await Promise.all([
      this.prisma.bloqueioIP.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.bloqueioIP.count({ where }),
    ]);

    return {
      success: true,
      data: bloqueios,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const bloqueio = await this.prisma.bloqueioIP.findUnique({ where: { id } });
    if (!bloqueio) throw new NotFoundException('Bloqueio não encontrado');
    return { success: true, data: bloqueio };
  }

  async create(dto: CriarBloqueioDto) {
    const bloqueio = await this.prisma.bloqueioIP.create({
      data: {
        ip: dto.ip,
        motivo: dto.motivo,
        criadoPor: dto.criadoPor,
        dataFim: dto.dataFim ? new Date(dto.dataFim) : null,
      },
    });
    return { success: true, data: bloqueio };
  }

  async update(id: string, dto: AtualizarBloqueioDto) {
    const bloqueio = await this.prisma.bloqueioIP.findUnique({ where: { id } });
    if (!bloqueio) throw new NotFoundException('Bloqueio não encontrado');

    const updated = await this.prisma.bloqueioIP.update({
      where: { id },
      data: {
        ...(dto.motivo !== undefined && { motivo: dto.motivo }),
        ...(dto.dataFim !== undefined && { dataFim: new Date(dto.dataFim) }),
        ...(dto.ativo !== undefined && { ativo: dto.ativo }),
      },
    });
    return { success: true, data: updated };
  }

  async remove(id: string) {
    const bloqueio = await this.prisma.bloqueioIP.findUnique({ where: { id } });
    if (!bloqueio) throw new NotFoundException('Bloqueio não encontrado');

    await this.prisma.bloqueioIP.delete({ where: { id } });
    return { success: true, message: 'Bloqueio removido com sucesso' };
  }

  async verificarIp(ip: string) {
    const bloqueio = await this.prisma.bloqueioIP.findFirst({
      where: {
        ip,
        ativo: true,
        AND: [
          { dataInicio: { lte: new Date() } },
          {
            OR: [
              { dataFim: null },
              { dataFim: { gte: new Date() } },
            ],
          },
        ],
      },
    });

    return {
      success: true,
      bloqueado: !!bloqueio,
      data: bloqueio || null,
    };
  }
}
