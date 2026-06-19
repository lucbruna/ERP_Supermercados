import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateContratoVeiculoDto, UpdateContratoVeiculoDto, ContratoVeiculoQueryDto } from './dto/contratos-veiculo.dto';

@Injectable()
export class ContratosVeiculoService {
  private readonly logger = new Logger(ContratosVeiculoService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateContratoVeiculoDto) {
    const contrato = await this.prisma.contratoVeiculo.create({ data: dto });
    this.logger.log(`Contrato criado: ${contrato.tipo} - ${contrato.id}`);
    return { success: true, data: contrato };
  }

  async findAll(query: ContratoVeiculoQueryDto) {
    const where: any = {};
    if (query.veiculoId) where.veiculoId = query.veiculoId;
    if (query.tipo) where.tipo = query.tipo;
    if (query.status) where.status = query.status;

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.contratoVeiculo.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { veiculo: { select: { placa: true } } },
      }),
      this.prisma.contratoVeiculo.count({ where }),
    ]);

    return { success: true, data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const contrato = await this.prisma.contratoVeiculo.findUnique({
      where: { id },
      include: { veiculo: { select: { placa: true, marca: true, modelo: true } } },
    });
    if (!contrato) throw new NotFoundException('Contrato não encontrado');
    return { success: true, data: contrato };
  }

  async update(id: string, dto: UpdateContratoVeiculoDto) {
    await this.findOne(id);
    const updated = await this.prisma.contratoVeiculo.update({ where: { id }, data: dto });
    return { success: true, data: updated };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.contratoVeiculo.delete({ where: { id } });
    return { success: true, message: 'Contrato removido' };
  }

  async findVencendo() {
    const trintaDias = new Date();
    trintaDias.setDate(trintaDias.getDate() + 30);

    const data = await this.prisma.contratoVeiculo.findMany({
      where: {
        status: 'ATIVO',
        dataVencimento: { lte: trintaDias, gte: new Date() },
      },
      orderBy: { dataVencimento: 'asc' },
      include: { veiculo: { select: { placa: true } } },
    });
    return { success: true, data };
  }
}
