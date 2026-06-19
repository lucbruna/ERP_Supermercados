import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateSeparacaoDto, UpdateSeparacaoDto, SeparacaoQueryDto } from '../dto/separacao.dto';
import { StatusSeparacao } from '@prisma/client';

@Injectable()
export class SeparacaoService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSeparacaoDto) {
    return this.prisma.separacaoPedido.create({
      data: {
        companyId: dto.companyId,
        pedidoId: dto.pedidoId,
        tipo: dto.tipo,
        itens: dto.itens,
        separadorId: dto.separadorId,
        conferenteId: dto.conferenteId,
        prioridade: dto.prioridade || 'MEDIA',
        observacao: dto.observacao,
      },
    });
  }

  async findAll(query: SeparacaoQueryDto) {
    const where: any = {};
    if (query.companyId) where.companyId = query.companyId;
    if (query.status) where.status = query.status;
    if (query.separadorId) where.separadorId = query.separadorId;
    return this.prisma.separacaoPedido.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { expedicao: true },
    });
  }

  async findOne(id: string) {
    const record = await this.prisma.separacaoPedido.findUnique({
      where: { id },
      include: { expedicao: true },
    });
    if (!record) throw new NotFoundException('Separacao not found');
    return record;
  }

  async update(id: string, dto: UpdateSeparacaoDto) {
    await this.findOne(id);
    return this.prisma.separacaoPedido.update({
      where: { id },
      data: {
        ...dto,
        dataFim: dto.dataFim ? new Date(dto.dataFim) : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.separacaoPedido.delete({ where: { id } });
  }

  async startSeparation(id: string) {
    const record = await this.findOne(id);
    if (record.status !== StatusSeparacao.PENDENTE) {
      throw new BadRequestException('Only pending orders can be started');
    }
    return this.prisma.separacaoPedido.update({
      where: { id },
      data: { status: StatusSeparacao.EM_SEPARACAO, dataInicio: new Date() },
    });
  }

  async completeSeparation(id: string) {
    const record = await this.findOne(id);
    if (record.status !== StatusSeparacao.EM_SEPARACAO) {
      throw new BadRequestException('Only orders in separation can be completed');
    }
    return this.prisma.separacaoPedido.update({
      where: { id },
      data: { status: StatusSeparacao.SEPARADO },
    });
  }

  async startConference(id: string) {
    const record = await this.findOne(id);
    if (record.status !== StatusSeparacao.SEPARADO) {
      throw new BadRequestException('Only separated orders can be reviewed');
    }
    return this.prisma.separacaoPedido.update({
      where: { id },
      data: { status: StatusSeparacao.EM_CONFERENCIA },
    });
  }

  async completeConference(id: string, conferenteId: string) {
    const record = await this.findOne(id);
    if (record.status !== StatusSeparacao.EM_CONFERENCIA) {
      throw new BadRequestException('Only orders in conference can be completed');
    }
    return this.prisma.separacaoPedido.update({
      where: { id },
      data: { status: StatusSeparacao.CONFERIDO, conferenteId, dataFim: new Date() },
    });
  }
}
