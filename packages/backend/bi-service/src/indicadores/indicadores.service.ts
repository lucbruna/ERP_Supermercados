import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateIndicadorDto, UpdateIndicadorDto } from '../dto/indicador.dto';

@Injectable()
export class IndicadoresService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateIndicadorDto) {
    return this.prisma.indicador.create({ data: dto });
  }

  async findAll(companyId?: string, categoria?: string) {
    const where: any = {};
    if (companyId) where.companyId = companyId;
    if (categoria) where.categoria = categoria;
    return this.prisma.indicador.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const record = await this.prisma.indicador.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Indicator not found');
    return record;
  }

  async update(id: string, dto: UpdateIndicadorDto) {
    await this.findOne(id);
    return this.prisma.indicador.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.indicador.delete({ where: { id } });
  }
}
