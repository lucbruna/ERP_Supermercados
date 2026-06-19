import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateDashboardDto, UpdateDashboardDto } from '../dto/dashboard.dto';

@Injectable()
export class DashboardsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDashboardDto) {
    return this.prisma.dashboardConfig.create({ data: dto });
  }

  async findAll(companyId?: string, ativo?: boolean) {
    const where: any = {};
    if (companyId) where.companyId = companyId;
    if (ativo !== undefined) where.ativo = ativo;
    return this.prisma.dashboardConfig.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const record = await this.prisma.dashboardConfig.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Dashboard not found');
    return record;
  }

  async update(id: string, dto: UpdateDashboardDto) {
    await this.findOne(id);
    return this.prisma.dashboardConfig.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.dashboardConfig.delete({ where: { id } });
  }

  async render(id: string) {
    const dashboard = await this.findOne(id);
    const kpis = await this.prisma.dashboardKPI.findMany({
      where: { companyId: dashboard.companyId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return { dashboard, kpis };
  }
}
