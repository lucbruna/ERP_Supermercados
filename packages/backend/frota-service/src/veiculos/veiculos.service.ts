import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateVeiculoDto, UpdateVeiculoDto, UpdateSituacaoDto, UpdateKmDto, VeiculoQueryDto } from './dto/veiculos.dto';

@Injectable()
export class VeiculosService {
  private readonly logger = new Logger(VeiculosService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateVeiculoDto) {
    const existing = await this.prisma.veiculo.findUnique({ where: { placa: dto.placa } });
    if (existing) throw new ConflictException('Placa já cadastrada');

    const veiculo = await this.prisma.veiculo.create({ data: dto });
    this.logger.log(`Veículo criado: ${veiculo.placa} - ${veiculo.marca} ${veiculo.modelo}`);
    return { success: true, data: veiculo };
  }

  async findAll(query: VeiculoQueryDto) {
    const where: any = {};
    if (query.situacao) where.situacao = query.situacao;
    if (query.tipo) where.tipo = query.tipo;
    if (query.search) {
      where.OR = [
        { placa: { contains: query.search, mode: 'insensitive' } },
        { marca: { contains: query.search, mode: 'insensitive' } },
        { modelo: { contains: query.search, mode: 'insensitive' } },
        { renavam: { contains: query.search } },
      ];
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.veiculo.findMany({ where, skip, take: limit, orderBy: { placa: 'asc' } }),
      this.prisma.veiculo.count({ where }),
    ]);

    return { success: true, data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const veiculo = await this.prisma.veiculo.findUnique({
      where: { id },
      include: { _count: { select: { abastecimentos: true, manutencoes: true, rotas: true, multas: true } } },
    });
    if (!veiculo) throw new NotFoundException('Veículo não encontrado');
    return { success: true, data: veiculo };
  }

  async findByPlaca(placa: string) {
    const veiculo = await this.prisma.veiculo.findUnique({ where: { placa } });
    if (!veiculo) throw new NotFoundException('Veículo não encontrado');
    return { success: true, data: veiculo };
  }

  async update(id: string, dto: UpdateVeiculoDto) {
    await this.findOne(id);
    const updated = await this.prisma.veiculo.update({ where: { id }, data: dto });
    return { success: true, data: updated };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.veiculo.update({ where: { id }, data: { situacao: 'BAIXADO' } });
    return { success: true, message: 'Veículo baixado' };
  }

  async findDisponiveis() {
    const veiculosEmRota = await this.prisma.rota.findMany({
      where: { status: { in: ['PLANEJADA', 'EM_ANDAMENTO'] } },
      select: { veiculoId: true },
    });
    const idsEmRota = veiculosEmRota.map(r => r.veiculoId);

    const data = await this.prisma.veiculo.findMany({
      where: {
        situacao: 'ATIVO',
        id: { notIn: idsEmRota },
      },
    });
    return { success: true, data };
  }

  async findCustos(id: string) {
    await this.findOne(id);

    const [abastecimentos, manutencoes] = await Promise.all([
      this.prisma.abastecimento.aggregate({ where: { veiculoId: id }, _sum: { valorTotal: true } }),
      this.prisma.manutencao.aggregate({ where: { veiculoId: id, status: 'CONCLUIDA' }, _sum: { valorTotal: true } }),
    ]);

    return {
      success: true,
      data: {
        veiculoId: id,
        totalAbastecimentos: abastecimentos._sum.valorTotal || 0,
        totalManutencoes: manutencoes._sum.valorTotal || 0,
        custoTotal: Number(abastecimentos._sum.valorTotal || 0) + Number(manutencoes._sum.valorTotal || 0),
      },
    };
  }

  async updateSituacao(id: string, dto: UpdateSituacaoDto) {
    await this.findOne(id);
    const updated = await this.prisma.veiculo.update({ where: { id }, data: { situacao: dto.situacao } });
    this.logger.log(`Veículo ${updated.placa} situação alterada para ${dto.situacao}`);
    return { success: true, data: updated };
  }

  async updateKm(id: string, dto: UpdateKmDto) {
    await this.findOne(id);
    const updated = await this.prisma.veiculo.update({ where: { id }, data: { kmAtual: dto.kmAtual } });
    this.logger.log(`Veículo ${updated.placa} km atualizado para ${dto.kmAtual}`);
    return { success: true, data: updated };
  }
}
