import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateUnidadeDto, UpdateUnidadeDto } from './dto/create-unidade.dto';

@Injectable()
export class UnidadeService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUnidadeDto) {
    const company = await this.prisma.company.findUnique({ where: { id: dto.companyId } });
    if (!company) throw new NotFoundException('Empresa não encontrada');
    return this.prisma.unidade.create({ data: dto });
  }

  async findByCompany(companyId: string) {
    return this.prisma.unidade.findMany({
      where: { companyId },
      orderBy: { nome: 'asc' },
    });
  }

  async findOne(id: string) {
    const unidade = await this.prisma.unidade.findUnique({ where: { id }, include: { company: true, _count: { select: { usuarios: true } } } });
    if (!unidade) throw new NotFoundException('Unidade não encontrada');
    return unidade;
  }

  async update(id: string, dto: UpdateUnidadeDto) {
    await this.findOne(id);
    return this.prisma.unidade.update({ where: { id }, data: dto });
  }

  async toggleStatus(id: string) {
    const unidade = await this.findOne(id);
    return this.prisma.unidade.update({ where: { id }, data: { ativo: !unidade.ativo } });
  }
}
