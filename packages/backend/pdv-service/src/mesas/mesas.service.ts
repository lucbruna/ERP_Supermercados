import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateMesaDto, UpdateMesaDto, AbrirMesaDto, MesaQueryDto } from './dto/mesa.dto';

@Injectable()
export class MesasService {
  private readonly logger = new Logger(MesasService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMesaDto) {
    const existing = await this.prisma.mesa.findUnique({
      where: { unidadeId_numero: { unidadeId: dto.unidadeId, numero: dto.numero } },
    });
    if (existing) throw new ConflictException('Mesa já cadastrada nesta unidade');
    return this.prisma.mesa.create({ data: dto });
  }

  async findAll(query: MesaQueryDto) {
    const where: any = {};
    if (query.companyId) where.companyId = query.companyId;
    if (query.unidadeId) where.unidadeId = query.unidadeId;
    if (query.status) where.status = query.status;
    return this.prisma.mesa.findMany({ where, orderBy: { numero: 'asc' } });
  }

  async findOne(id: string) {
    const mesa = await this.prisma.mesa.findUnique({ where: { id } });
    if (!mesa) throw new NotFoundException('Mesa não encontrada');
    return mesa;
  }

  async update(id: string, dto: UpdateMesaDto) {
    await this.findOne(id);
    const data: any = { ...dto };
    return this.prisma.mesa.update({ where: { id }, data } as any);
  }

  async abrir(id: string, dto: AbrirMesaDto) {
    const mesa = await this.findOne(id);
    if (mesa.status !== 'LIVRE' && mesa.status !== 'RESERVADA') {
      throw new ConflictException('Mesa não está disponível');
    }
    return this.prisma.mesa.update({
      where: { id },
      data: { status: 'OCUPADA', vendaId: dto.vendaId },
    });
  }

  async fechar(id: string) {
    const mesa = await this.findOne(id);
    if (mesa.status !== 'OCUPADA') throw new ConflictException('Mesa não está ocupada');
    return this.prisma.mesa.update({
      where: { id },
      data: { status: 'LIVRE', vendaId: null },
    });
  }

  async reservar(id: string) {
    await this.findOne(id);
    return this.prisma.mesa.update({ where: { id }, data: { status: 'RESERVADA' } });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.mesa.delete({ where: { id } });
  }
}
