import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CriarRegraDto, AtualizarRegraDto } from './dto/regra.dto';

@Injectable()
export class RegrasService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string, query: { page?: number; limit?: number; tipo?: string; ativo?: boolean }) {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = { companyId };
    if (query.tipo) where.tipo = query.tipo;
    if (query.ativo !== undefined) where.ativo = query.ativo;

    const [regras, total] = await Promise.all([
      this.prisma.regraSeguranca.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.regraSeguranca.count({ where }),
    ]);

    return {
      success: true,
      data: regras,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const regra = await this.prisma.regraSeguranca.findUnique({ where: { id } });
    if (!regra) throw new NotFoundException('Regra de segurança não encontrada');
    return { success: true, data: regra };
  }

  async create(companyId: string, dto: CriarRegraDto) {
    const regra = await this.prisma.regraSeguranca.create({
      data: {
        companyId,
        nome: dto.nome,
        tipo: dto.tipo,
        config: dto.config,
        ativo: dto.ativo ?? true,
        criadoPor: dto.criadoPor,
      },
    });
    return { success: true, data: regra };
  }

  async update(id: string, dto: AtualizarRegraDto) {
    const regra = await this.prisma.regraSeguranca.findUnique({ where: { id } });
    if (!regra) throw new NotFoundException('Regra de segurança não encontrada');

    const updated = await this.prisma.regraSeguranca.update({
      where: { id },
      data: {
        ...(dto.nome !== undefined && { nome: dto.nome }),
        ...(dto.tipo !== undefined && { tipo: dto.tipo }),
        ...(dto.config !== undefined && { config: dto.config }),
        ...(dto.ativo !== undefined && { ativo: dto.ativo }),
      },
    });
    return { success: true, data: updated };
  }

  async toggle(id: string) {
    const regra = await this.prisma.regraSeguranca.findUnique({ where: { id } });
    if (!regra) throw new NotFoundException('Regra de segurança não encontrada');

    const updated = await this.prisma.regraSeguranca.update({
      where: { id },
      data: { ativo: !regra.ativo },
    });
    return { success: true, data: updated };
  }

  async remove(id: string) {
    const regra = await this.prisma.regraSeguranca.findUnique({ where: { id } });
    if (!regra) throw new NotFoundException('Regra de segurança não encontrada');

    await this.prisma.regraSeguranca.delete({ where: { id } });
    return { success: true, message: 'Regra removida com sucesso' };
  }
}
