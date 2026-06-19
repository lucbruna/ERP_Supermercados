import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateRoteirizacaoDto, UpdateRoteirizacaoDto } from '../dto/roteirizacao.dto';
import { RoteirizadorService } from '../services/roteirizador.service';
import { StatusRoteirizacao } from '@prisma/client';

@Injectable()
export class RoteirizacaoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly roteirizador: RoteirizadorService,
  ) {}

  async create(dto: CreateRoteirizacaoDto) {
    return this.prisma.roteirizacao.create({
      data: {
        companyId: dto.companyId,
        origemUnidadeId: dto.origemUnidadeId,
        entregas: dto.entregas,
        distanciaKm: dto.distanciaKm,
        tempoEstimado: dto.tempoEstimado,
        custoFrete: dto.custoFrete,
        motoristaId: dto.motoristaId,
        veiculoId: dto.veiculoId,
        dataSaida: new Date(dto.dataSaida),
        dataPrevisao: new Date(dto.dataPrevisao),
        dataChegada: dto.dataChegada ? new Date(dto.dataChegada) : undefined,
      },
    });
  }

  async findAll(companyId?: string) {
    const where: any = {};
    if (companyId) where.companyId = companyId;
    return this.prisma.roteirizacao.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { motorista: true, veiculo: true, expedicoes: true },
    });
  }

  async findOne(id: string) {
    const record = await this.prisma.roteirizacao.findUnique({
      where: { id },
      include: { motorista: true, veiculo: true, expedicoes: true },
    });
    if (!record) throw new NotFoundException('Route not found');
    return record;
  }

  async update(id: string, dto: UpdateRoteirizacaoDto) {
    await this.findOne(id);
    return this.prisma.roteirizacao.update({
      where: { id },
      data: {
        ...dto,
        dataSaida: dto.dataSaida ? new Date(dto.dataSaida) : undefined,
        dataPrevisao: dto.dataPrevisao ? new Date(dto.dataPrevisao) : undefined,
        dataChegada: dto.dataChegada ? new Date(dto.dataChegada) : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.roteirizacao.delete({ where: { id } });
  }

  async start(id: string) {
    const record = await this.findOne(id);
    if (record.status !== StatusRoteirizacao.PLANEJADA) {
      throw new BadRequestException('Only planned routes can be started');
    }
    return this.prisma.roteirizacao.update({
      where: { id },
      data: { status: StatusRoteirizacao.EM_ROTA },
    });
  }

  async finish(id: string) {
    const record = await this.findOne(id);
    if (record.status !== StatusRoteirizacao.EM_ROTA) {
      throw new BadRequestException('Only routes in progress can be finished');
    }
    return this.prisma.roteirizacao.update({
      where: { id },
      data: { status: StatusRoteirizacao.FINALIZADA, dataChegada: new Date() },
    });
  }

  async cancel(id: string) {
    await this.findOne(id);
    return this.prisma.roteirizacao.update({
      where: { id },
      data: { status: StatusRoteirizacao.CANCELADA },
    });
  }

  async optimize(origemUnidadeId: string, entregas: any[], motoristaId: string, veiculoId: string) {
    const veiculo = await this.prisma.veiculo.findUnique({ where: { id: veiculoId } });
    if (!veiculo) throw new NotFoundException('Vehicle not found');

    const result = await this.roteirizador.optimizeRoute(origemUnidadeId, entregas, veiculo);

    return this.prisma.roteirizacao.create({
      data: {
        companyId: veiculo.companyId,
        origemUnidadeId,
        entregas: result.entregas as any,
        distanciaKm: result.distanciaKm,
        tempoEstimado: result.tempoEstimado,
        custoFrete: result.custoFrete,
        motoristaId,
        veiculoId,
        dataSaida: new Date(),
        dataPrevisao: new Date(Date.now() + result.tempoEstimado * 60000),
        status: StatusRoteirizacao.PLANEJADA,
      },
    });
  }
}
