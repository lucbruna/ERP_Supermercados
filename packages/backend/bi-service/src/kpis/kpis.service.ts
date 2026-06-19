import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateKpiDto, UpdateKpiDto, KpiQueryDto } from '../dto/kpi.dto';
import { KpiCalculatorService } from '../services/kpi-calculator.service';

@Injectable()
export class KpisService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly calculator: KpiCalculatorService,
  ) {}

  async create(dto: CreateKpiDto) {
    return this.prisma.dashboardKPI.create({
      data: {
        ...dto,
        dataReferencia: dto.dataReferencia ? new Date(dto.dataReferencia) : new Date(),
      },
    });
  }

  async findAll(query: KpiQueryDto) {
    const where: any = {};
    if (query.companyId) where.companyId = query.companyId;
    if (query.categoria) where.categoria = query.categoria;
    if (query.periodo) where.periodo = query.periodo;
    if (query.unidadeId) where.unidadeId = query.unidadeId;
    return this.prisma.dashboardKPI.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const record = await this.prisma.dashboardKPI.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('KPI not found');
    return record;
  }

  async update(id: string, dto: UpdateKpiDto) {
    await this.findOne(id);
    return this.prisma.dashboardKPI.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.dashboardKPI.delete({ where: { id } });
  }

  async calculate(companyId: string, categoria?: string) {
    const results = await this.calculator.calculateAll(companyId, categoria);
    return results;
  }
}
