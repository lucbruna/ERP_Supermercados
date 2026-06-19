import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateTipoContratoDto, UpdateTipoContratoDto } from './dto/create-tipo.dto';

@Injectable()
export class TiposService {
  private readonly logger = new Logger(TiposService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTipoContratoDto) {
    const existing = await this.prisma.tipoContrato.findUnique({
      where: { nome: dto.nome },
    });
    if (existing) throw new ConflictException('Tipo de contrato já existe');

    const tipo = await this.prisma.tipoContrato.create({
      data: {
        nome: dto.nome,
        descricao: dto.descricao,
      },
    });

    this.logger.log(`Tipo de contrato criado: ${tipo.nome}`);
    return { success: true, data: tipo };
  }

  async findAll() {
    const data = await this.prisma.tipoContrato.findMany({
      orderBy: { nome: 'asc' },
      include: { _count: { select: { contratos: true } } },
    });
    return { success: true, data };
  }

  async findOne(id: string) {
    const tipo = await this.prisma.tipoContrato.findUnique({
      where: { id },
      include: { _count: { select: { contratos: true } } },
    });
    if (!tipo) throw new NotFoundException('Tipo de contrato não encontrado');
    return { success: true, data: tipo };
  }

  async update(id: string, dto: UpdateTipoContratoDto) {
    await this.findOne(id);

    if (dto.nome) {
      const existing = await this.prisma.tipoContrato.findUnique({
        where: { nome: dto.nome },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('Tipo de contrato já existe');
      }
    }

    const updated = await this.prisma.tipoContrato.update({
      where: { id },
      data: dto,
    });

    return { success: true, data: updated };
  }

  async remove(id: string) {
    const tipo = await this.findOne(id);
    if (tipo.data._count.contratos > 0) {
      throw new ConflictException('Não é possível excluir tipo com contratos vinculados');
    }

    await this.prisma.tipoContrato.delete({ where: { id } });
    return { success: true, message: 'Tipo de contrato removido com sucesso' };
  }
}
