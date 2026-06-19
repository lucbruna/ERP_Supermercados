import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreatePdvDto, UpdatePdvDto, AberturaPdvDto, FechamentoPdvDto, PdvQueryDto } from './dto/pdv.dto';
import { PdvStatus } from '@prisma/client';

@Injectable()
export class PdvService {
  private readonly logger = new Logger(PdvService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePdvDto) {
    const existing = await this.prisma.pDV.findFirst({
      where: { companyId: dto.companyId, codigo: dto.codigo },
    });
    if (existing) {
      throw new BadRequestException('Já existe um PDV com este código na empresa');
    }

    const pdv = await this.prisma.pDV.create({
      data: {
        companyId: dto.companyId,
        unidadeId: dto.unidadeId,
        codigo: dto.codigo,
        nome: dto.nome,
        tipo: dto.tipo as any,
        ip: dto.ip,
        mac: dto.mac,
      },
    });
    return { success: true, data: pdv };
  }

  async findAll(query: PdvQueryDto) {
    const where: any = {};
    if (query.companyId) where.companyId = query.companyId;
    if (query.unidadeId) where.unidadeId = query.unidadeId;
    if (query.status) where.status = query.status;

    const pdvs = await this.prisma.pDV.findMany({ where, orderBy: { codigo: 'asc' } });
    return { success: true, data: pdvs };
  }

  async findOne(id: string) {
    const pdv = await this.prisma.pDV.findUnique({ where: { id } });
    if (!pdv) throw new NotFoundException('PDV não encontrado');
    return { success: true, data: pdv };
  }

  async update(id: string, dto: UpdatePdvDto) {
    const pdv = await this.prisma.pDV.findUnique({ where: { id } });
    if (!pdv) throw new NotFoundException('PDV não encontrado');

    const updated = await this.prisma.pDV.update({
      where: { id },
      data: {
        ...(dto.nome !== undefined && { nome: dto.nome }),
        ...(dto.tipo !== undefined && { tipo: dto.tipo as any }),
        ...(dto.ip !== undefined && { ip: dto.ip }),
        ...(dto.mac !== undefined && { mac: dto.mac }),
        ...(dto.status !== undefined && { status: dto.status as any }),
        ...(dto.operadorId !== undefined && { operadorId: dto.operadorId }),
      },
    });
    return { success: true, data: updated };
  }

  async abrir(id: string, dto: AberturaPdvDto) {
    const pdv = await this.prisma.pDV.findUnique({ where: { id } });
    if (!pdv) throw new NotFoundException('PDV não encontrado');

    if (pdv.status !== 'FECHADO' && pdv.status !== 'LIVRE') {
      throw new BadRequestException(`PDV não pode ser aberto no status ${pdv.status}`);
    }

    const updated = await this.prisma.pDV.update({
      where: { id },
      data: {
        status: PdvStatus.LIVRE,
        operadorId: dto.operadorId,
        ultimaAbertura: new Date(),
        saldoAbertura: dto.saldoAbertura,
      },
    });

    this.logger.log(`PDV ${pdv.codigo} aberto pelo operador ${dto.operadorId}`);
    return { success: true, data: updated };
  }

  async fechar(id: string, dto: FechamentoPdvDto) {
    const pdv = await this.prisma.pDV.findUnique({ where: { id } });
    if (!pdv) throw new NotFoundException('PDV não encontrado');

    if (pdv.status === 'FECHADO') {
      throw new BadRequestException('PDV já está fechado');
    }

    const updated = await this.prisma.pDV.update({
      where: { id },
      data: {
        status: PdvStatus.FECHADO,
        operadorId: dto.operadorId,
        ultimoFechamento: new Date(),
        saldoFechamento: dto.saldoFechamento,
      },
    });

    this.logger.log(`PDV ${pdv.codigo} fechado pelo operador ${dto.operadorId}`);
    return { success: true, data: updated };
  }

  async alterarStatus(id: string, status: PdvStatus) {
    const pdv = await this.prisma.pDV.findUnique({ where: { id } });
    if (!pdv) throw new NotFoundException('PDV não encontrado');

    const updated = await this.prisma.pDV.update({
      where: { id },
      data: { status },
    });
    return { success: true, data: updated };
  }

  async remove(id: string) {
    const pdv = await this.prisma.pDV.findUnique({ where: { id } });
    if (!pdv) throw new NotFoundException('PDV não encontrado');

    await this.prisma.pDV.delete({ where: { id } });
    return { success: true, message: 'PDV removido com sucesso' };
  }
}
