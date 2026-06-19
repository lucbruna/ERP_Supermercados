import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateMotoristaDto, UpdateMotoristaDto } from '../dto/motorista.dto';

@Injectable()
export class MotoristasService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMotoristaDto) {
    return this.prisma.motorista.create({
      data: { ...dto, validadeCNH: new Date(dto.validadeCNH) },
    });
  }

  async findAll(companyId?: string, ativo?: boolean) {
    const where: any = {};
    if (companyId) where.companyId = companyId;
    if (ativo !== undefined) where.ativo = ativo;
    return this.prisma.motorista.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const record = await this.prisma.motorista.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Driver not found');
    return record;
  }

  async update(id: string, dto: UpdateMotoristaDto) {
    await this.findOne(id);
    return this.prisma.motorista.update({
      where: { id },
      data: {
        ...dto,
        validadeCNH: dto.validadeCNH ? new Date(dto.validadeCNH) : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.motorista.delete({ where: { id } });
  }
}
