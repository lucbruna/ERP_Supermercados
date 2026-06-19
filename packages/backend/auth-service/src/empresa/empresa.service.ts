import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateEmpresaDto, UpdateEmpresaDto } from './dto/create-empresa.dto';

@Injectable()
export class EmpresaService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateEmpresaDto) {
    const existing = await this.prisma.company.findUnique({ where: { cnpj: dto.cnpj } });
    if (existing) throw new ConflictException('CNPJ já cadastrado');
    return this.prisma.company.create({ data: dto });
  }

  async findAll() {
    return this.prisma.company.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const empresa = await this.prisma.company.findUnique({
      where: { id },
      include: { unidades: true, _count: { select: { usuarios: true } } },
    });
    if (!empresa) throw new NotFoundException('Empresa não encontrada');
    return empresa;
  }

  async update(id: string, dto: UpdateEmpresaDto) {
    await this.findOne(id);
    if (dto.cnpj) {
      const dup = await this.prisma.company.findFirst({ where: { cnpj: dto.cnpj, NOT: { id } } });
      if (dup) throw new ConflictException('CNPJ já cadastrado');
    }
    return this.prisma.company.update({ where: { id }, data: dto });
  }

  async toggleStatus(id: string) {
    const empresa = await this.findOne(id);
    return this.prisma.company.update({ where: { id }, data: { ativo: !empresa.ativo } });
  }
}
