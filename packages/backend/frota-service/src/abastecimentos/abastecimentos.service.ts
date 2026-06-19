import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateAbastecimentoDto, UpdateAbastecimentoDto, AbastecimentoQueryDto, RelatorioConsumoQueryDto } from './dto/abastecimentos.dto';

@Injectable()
export class AbastecimentosService {
  private readonly logger = new Logger(AbastecimentosService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAbastecimentoDto) {
    const abastecimento = await this.prisma.abastecimento.create({ data: dto });
    this.logger.log(`Abastecimento registrado: ${abastecimento.litros}L - R$${abastecimento.valorTotal}`);
    return { success: true, data: abastecimento };
  }

  async findAll(query: AbastecimentoQueryDto) {
    const where: any = {};
    if (query.veiculoId) where.veiculoId = query.veiculoId;

    if (query.dataInicio || query.dataFim || query.periodo) {
      where.data = {};
      if (query.dataInicio) where.data.gte = new Date(query.dataInicio);
      if (query.dataFim) where.data.lte = new Date(query.dataFim);
      if (query.periodo && !query.dataInicio) {
        const days = parseInt(query.periodo) || 30;
        where.data.gte = new Date(new Date().setDate(new Date().getDate() - days));
      }
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.abastecimento.findMany({
        where,
        skip,
        take: limit,
        orderBy: { data: 'desc' },
        include: { veiculo: { select: { placa: true } }, motorista: { select: { nome: true } } },
      }),
      this.prisma.abastecimento.count({ where }),
    ]);

    return { success: true, data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const abastecimento = await this.prisma.abastecimento.findUnique({
      where: { id },
      include: { veiculo: { select: { placa: true, marca: true, modelo: true } }, motorista: { select: { nome: true } } },
    });
    if (!abastecimento) throw new NotFoundException('Abastecimento não encontrado');
    return { success: true, data: abastecimento };
  }

  async update(id: string, dto: UpdateAbastecimentoDto) {
    await this.findOne(id);
    const updated = await this.prisma.abastecimento.update({ where: { id }, data: dto });
    return { success: true, data: updated };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.abastecimento.delete({ where: { id } });
    return { success: true, message: 'Abastecimento removido' };
  }

  async relatorioConsumo(query: RelatorioConsumoQueryDto) {
    const where: any = {};
    if (query.veiculoId) where.veiculoId = query.veiculoId;

    if (query.dataInicio || query.dataFim || query.periodo) {
      where.data = {};
      if (query.dataInicio) where.data.gte = new Date(query.dataInicio);
      if (query.dataFim) where.data.lte = new Date(query.dataFim);
      if (query.periodo && !query.dataInicio) {
        const days = parseInt(query.periodo) || 30;
        where.data.gte = new Date(new Date().setDate(new Date().getDate() - days));
      }
    }

    const abastecimentos = await this.prisma.abastecimento.findMany({
      where,
      include: { veiculo: { select: { placa: true, kmAtual: true } } },
      orderBy: { data: 'asc' },
    });

    const consumoPorVeiculo: any = {};
    for (const item of abastecimentos) {
      const placa = item.veiculo.placa;
      if (!consumoPorVeiculo[placa]) {
        consumoPorVeiculo[placa] = { placa, totalLitros: 0, totalValor: 0, abastecimentos: 0 };
      }
      consumoPorVeiculo[placa].totalLitros += Number(item.litros);
      consumoPorVeiculo[placa].totalValor += Number(item.valorTotal);
      consumoPorVeiculo[placa].abastecimentos++;
    }

    const data = Object.values(consumoPorVeiculo).map((item: any) => ({
      ...item,
      mediaPrecoLitro: item.abastecimentos > 0 ? item.totalValor / item.totalLitros : 0,
    }));

    return { success: true, data };
  }
}
