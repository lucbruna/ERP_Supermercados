import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateManutencaoDto, UpdateManutencaoDto, ManutencaoQueryDto, CustosManutencaoQueryDto } from './dto/manutencoes.dto';

@Injectable()
export class ManutencoesService {
  private readonly logger = new Logger(ManutencoesService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateManutencaoDto) {
    const manutencao = await this.prisma.manutencao.create({ data: dto });

    if (manutencao.status === 'AGENDADA' || manutencao.status === 'EM_ANDAMENTO') {
      await this.prisma.veiculo.update({ where: { id: dto.veiculoId }, data: { situacao: 'MANUTENCAO' } });
    }

    this.logger.log(`Manutenção criada: ${manutencao.tipo} - ${manutencao.descricao}`);
    return { success: true, data: manutencao };
  }

  async findAll(query: ManutencaoQueryDto) {
    const where: any = {};
    if (query.veiculoId) where.veiculoId = query.veiculoId;
    if (query.status) where.status = query.status;

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.manutencao.findMany({
        where,
        skip,
        take: limit,
        orderBy: { data: 'desc' },
        include: { veiculo: { select: { placa: true } } },
      }),
      this.prisma.manutencao.count({ where }),
    ]);

    return { success: true, data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const manutencao = await this.prisma.manutencao.findUnique({
      where: { id },
      include: { veiculo: { select: { placa: true, marca: true, modelo: true } } },
    });
    if (!manutencao) throw new NotFoundException('Manutenção não encontrada');
    return { success: true, data: manutencao };
  }

  async update(id: string, dto: UpdateManutencaoDto) {
    await this.findOne(id);
    const updated = await this.prisma.manutencao.update({ where: { id }, data: dto });
    return { success: true, data: updated };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.manutencao.delete({ where: { id } });
    return { success: true, message: 'Manutenção removida' };
  }

  async findAgendadas() {
    const data = await this.prisma.manutencao.findMany({
      where: { status: { in: ['AGENDADA', 'EM_ANDAMENTO'] } },
      orderBy: { data: 'asc' },
      include: { veiculo: { select: { placa: true, marca: true, modelo: true } } },
    });
    return { success: true, data };
  }

  async concluir(id: string) {
    const manutencao = await this.findOne(id);
    if (manutencao.data.status === 'CONCLUIDA') {
      throw new NotFoundException('Manutenção já está concluída');
    }

    const updated = await this.prisma.manutencao.update({
      where: { id },
      data: { status: 'CONCLUIDA' },
    });

    const temOutrasPendentes = await this.prisma.manutencao.count({
      where: { veiculoId: manutencao.data.veiculoId, status: { in: ['AGENDADA', 'EM_ANDAMENTO'] }, id: { not: id } },
    });

    if (temOutrasPendentes === 0) {
      await this.prisma.veiculo.update({ where: { id: manutencao.data.veiculoId }, data: { situacao: 'ATIVO' } });
    }

    this.logger.log(`Manutenção ${id} concluída`);
    return { success: true, data: updated };
  }

  async relatorioCustos(query: CustosManutencaoQueryDto) {
    const where: any = { status: 'CONCLUIDA' };
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

    const manutencoes = await this.prisma.manutencao.findMany({
      where,
      include: { veiculo: { select: { placa: true } } },
      orderBy: { data: 'asc' },
    });

    const total = manutencoes.reduce((acc, m) => ({
      valorPecas: acc.valorPecas + Number(m.valorPecas || 0),
      valorMaoObra: acc.valorMaoObra + Number(m.valorMaoObra || 0),
      valorTotal: acc.valorTotal + Number(m.valorTotal),
    }), { valorPecas: 0, valorMaoObra: 0, valorTotal: 0 });

    return { success: true, data: { total, manutencoes, quantidade: manutencoes.length } };
  }
}
