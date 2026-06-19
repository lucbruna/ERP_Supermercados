import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateTemplateDto, UpdateTemplateDto } from '../dto/template.dto';

@Injectable()
export class TemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTemplateDto) {
    const existing = await this.prisma.templateNotificacao.findUnique({
      where: { companyId_nome: { companyId: dto.companyId, nome: dto.nome } },
    });
    if (existing) throw new ConflictException('Template name already exists for this company');
    return this.prisma.templateNotificacao.create({ data: dto });
  }

  async findAll(companyId?: string, tipo?: string) {
    const where: any = {};
    if (companyId) where.companyId = companyId;
    if (tipo) where.tipo = tipo;
    return this.prisma.templateNotificacao.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const record = await this.prisma.templateNotificacao.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Template not found');
    return record;
  }

  async update(id: string, dto: UpdateTemplateDto) {
    await this.findOne(id);
    return this.prisma.templateNotificacao.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.templateNotificacao.delete({ where: { id } });
  }
}
