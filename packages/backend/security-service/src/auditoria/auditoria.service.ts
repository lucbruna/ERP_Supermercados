import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { AuditoriaQueryDto, AuditoriaExportDto } from './dto/auditoria-query.dto';

@Injectable()
export class AuditoriaService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string, query: AuditoriaQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = { companyId };
    if (query.tipo) where.tipo = query.tipo;
    if (query.gravidade) where.gravidade = query.gravidade;
    if (query.recurso) where.recurso = { contains: query.recurso, mode: 'insensitive' };
    if (query.usuarioId) where.usuarioId = query.usuarioId;
    if (query.dataInicio || query.dataFim) {
      where.createdAt = {};
      if (query.dataInicio) where.createdAt.gte = new Date(query.dataInicio);
      if (query.dataFim) where.createdAt.lte = new Date(query.dataFim);
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditoriaSeguranca.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditoriaSeguranca.count({ where }),
    ]);

    return {
      success: true,
      data: logs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const log = await this.prisma.auditoriaSeguranca.findUnique({ where: { id } });
    if (!log) throw new NotFoundException('Registro de auditoria não encontrado');
    return { success: true, data: log };
  }

  async export(companyId: string, filters: AuditoriaExportDto) {
    const where: any = { companyId };
    if (filters.tipo) where.tipo = filters.tipo;
    if (filters.gravidade) where.gravidade = filters.gravidade;
    if (filters.recurso) where.recurso = { contains: filters.recurso, mode: 'insensitive' };
    if (filters.dataInicio || filters.dataFim) {
      where.createdAt = {};
      if (filters.dataInicio) where.createdAt.gte = new Date(filters.dataInicio);
      if (filters.dataFim) where.createdAt.lte = new Date(filters.dataFim);
    }

    const logs = await this.prisma.auditoriaSeguranca.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, data: logs };
  }

  async getResumo(companyId: string) {
    const [total, porTipo, porGravidade] = await Promise.all([
      this.prisma.auditoriaSeguranca.count({ where: { companyId } }),
      this.prisma.auditoriaSeguranca.groupBy({
        by: ['tipo'],
        where: { companyId },
        _count: true,
      }),
      this.prisma.auditoriaSeguranca.groupBy({
        by: ['gravidade'],
        where: { companyId },
        _count: true,
      }),
    ]);

    return {
      success: true,
      data: { total, porTipo, porGravidade },
    };
  }

  async registrar(dto: {
    companyId: string;
    usuarioId: string;
    acao: string;
    recurso: string;
    recursoId?: string;
    ip: string;
    userAgent: string;
    tipo?: string;
    gravidade?: string;
    detalhes?: string;
    metadata?: any;
  }) {
    const log = await this.prisma.auditoriaSeguranca.create({
      data: {
        companyId: dto.companyId,
        usuarioId: dto.usuarioId,
        acao: dto.acao,
        recurso: dto.recurso,
        recursoId: dto.recursoId,
        ip: dto.ip,
        userAgent: dto.userAgent,
        tipo: dto.tipo || 'ACESSO',
        gravidade: dto.gravidade || 'BAIXA',
        detalhes: dto.detalhes,
        metadata: dto.metadata || undefined,
      },
    });

    return { success: true, data: log };
  }
}
