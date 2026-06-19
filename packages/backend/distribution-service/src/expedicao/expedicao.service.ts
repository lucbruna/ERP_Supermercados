import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateExpedicaoDto, UpdateExpedicaoDto } from '../dto/expedicao.dto';
import { StatusSeparacao, StatusExpedicao } from '@prisma/client';

@Injectable()
export class ExpedicaoService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateExpedicaoDto) {
    const separacao = await this.prisma.separacaoPedido.findUnique({ where: { id: dto.separacaoId } });
    if (!separacao) throw new NotFoundException('Picking order not found');
    if (separacao.status !== StatusSeparacao.CONFERIDO) {
      throw new BadRequestException('Picking order must be CONFEREIDO before dispatch');
    }

    const expedicao = await this.prisma.expedicao.create({ data: dto });

    await this.prisma.separacaoPedido.update({
      where: { id: dto.separacaoId },
      data: { status: StatusSeparacao.EXPEDIDO },
    });

    return expedicao;
  }

  async findAll(roteirizacaoId?: string) {
    const where: any = {};
    if (roteirizacaoId) where.roteirizacaoId = roteirizacaoId;
    return this.prisma.expedicao.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { separacao: true, roteirizacao: true },
    });
  }

  async findOne(id: string) {
    const record = await this.prisma.expedicao.findUnique({
      where: { id },
      include: { separacao: true, roteirizacao: true },
    });
    if (!record) throw new NotFoundException('Dispatch not found');
    return record;
  }

  async update(id: string, dto: UpdateExpedicaoDto) {
    await this.findOne(id);
    return this.prisma.expedicao.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.expedicao.delete({ where: { id } });
  }

  async dispatch(id: string) {
    const record = await this.findOne(id);
    if (record.status !== StatusExpedicao.PENDENTE) {
      throw new BadRequestException('Only pending dispatches can be processed');
    }
    return this.prisma.expedicao.update({
      where: { id },
      data: { status: StatusExpedicao.EXPEDIDO },
    });
  }

  async cancel(id: string) {
    const record = await this.findOne(id);
    if (record.status === StatusExpedicao.EXPEDIDO) {
      throw new BadRequestException('Cannot cancel an already dispatched order');
    }
    return this.prisma.expedicao.update({
      where: { id },
      data: { status: StatusExpedicao.CANCELADO },
    });
  }
}
