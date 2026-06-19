import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string, query: { page?: number; limit?: number; gravidade?: string; recurso?: string; userId?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = { companyId };
    if (query.gravidade) where.gravidade = query.gravidade;
    if (query.recurso) where.recurso = { contains: query.recurso };
    if (query.userId) where.userId = query.userId;

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      success: true,
      data: logs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const log = await this.prisma.auditLog.findUnique({ where: { id } });
    return { success: true, log };
  }
}
