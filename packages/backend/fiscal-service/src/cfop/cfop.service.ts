import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateCfopDto, UpdateCfopDto, CfopQueryDto } from './dto/cfop.dto';

@Injectable()
export class CfopService {
  private readonly logger = new Logger(CfopService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCfopDto) {
    const existing = await this.prisma.cfop.findUnique({ where: { codigo: dto.codigo } });
    if (existing) throw new ConflictException('CFOP já cadastrado');
    return this.prisma.cfop.create({ data: dto });
  }

  async findAll(query: CfopQueryDto) {
    const where: any = {};
    if (query.tipo) where.tipo = query.tipo;
    if (query.search) {
      where.OR = [
        { codigo: { contains: query.search, mode: 'insensitive' } },
        { descricao: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    return this.prisma.cfop.findMany({ where, orderBy: { codigo: 'asc' } });
  }

  async findOne(id: string) {
    const cfop = await this.prisma.cfop.findUnique({ where: { id } });
    if (!cfop) throw new NotFoundException('CFOP não encontrado');
    return cfop;
  }

  async update(id: string, dto: UpdateCfopDto) {
    await this.findOne(id);
    if (dto.codigo) {
      const existing = await this.prisma.cfop.findUnique({ where: { codigo: dto.codigo } });
      if (existing && existing.id !== id) throw new ConflictException('CFOP já cadastrado');
    }
    return this.prisma.cfop.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.cfop.delete({ where: { id } });
  }
}
