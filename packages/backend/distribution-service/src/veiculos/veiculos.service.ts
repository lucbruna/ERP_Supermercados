import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateVeiculoDto, UpdateVeiculoDto } from '../dto/veiculo.dto';

@Injectable()
export class VeiculosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateVeiculoDto) {
    return this.prisma.veiculo.create({ data: dto });
  }

  async findAll(companyId?: string) {
    const where: any = {};
    if (companyId) where.companyId = companyId;
    return this.prisma.veiculo.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { roteirizacoes: true },
    });
  }

  async findOne(id: string) {
    const record = await this.prisma.veiculo.findUnique({
      where: { id },
      include: { roteirizacoes: true },
    });
    if (!record) throw new NotFoundException('Vehicle not found');
    return record;
  }

  async update(id: string, dto: UpdateVeiculoDto) {
    await this.findOne(id);
    return this.prisma.veiculo.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.veiculo.delete({ where: { id } });
  }

  async updateStatus(id: string, status: string) {
    await this.findOne(id);
    return this.prisma.veiculo.update({ where: { id }, data: { status: status as any } });
  }
}
