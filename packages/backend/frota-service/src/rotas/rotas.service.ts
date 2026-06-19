import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateRotaDto, UpdateRotaDto, ConcluirRotaDto, RotaQueryDto } from './dto/rotas.dto';

@Injectable()
export class RotasService {
  private readonly logger = new Logger(RotasService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateRotaDto) {
    const rota = await this.prisma.rota.create({
      data: dto,
      include: { veiculo: { select: { placa: true } }, motorista: { select: { nome: true } } },
    });
    this.logger.log(`Rota criada: ${rota.descricao} - ${rota.origem} -> ${rota.destino}`);
    return { success: true, data: rota };
  }

  async findAll(query: RotaQueryDto) {
    const where: any = {};
    if (query.veiculoId) where.veiculoId = query.veiculoId;
    if (query.motoristaId) where.motoristaId = query.motoristaId;
    if (query.status) where.status = query.status;

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.rota.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { veiculo: { select: { placa: true } }, motorista: { select: { nome: true } } },
      }),
      this.prisma.rota.count({ where }),
    ]);

    return { success: true, data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const rota = await this.prisma.rota.findUnique({
      where: { id },
      include: { veiculo: { select: { placa: true, marca: true, modelo: true, kmAtual: true } }, motorista: { select: { nome: true, cpf: true } } },
    });
    if (!rota) throw new NotFoundException('Rota não encontrada');
    return { success: true, data: rota };
  }

  async update(id: string, dto: UpdateRotaDto) {
    await this.findOne(id);
    const updated = await this.prisma.rota.update({
      where: { id },
      data: dto,
      include: { veiculo: { select: { placa: true } }, motorista: { select: { nome: true } } },
    });
    return { success: true, data: updated };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.rota.delete({ where: { id } });
    return { success: true, message: 'Rota removida' };
  }

  async iniciar(id: string) {
    const rota = await this.findOne(id);
    if (rota.data.status !== 'PLANEJADA') {
      throw new BadRequestException('Apenas rotas planejadas podem ser iniciadas');
    }

    const updated = await this.prisma.rota.update({
      where: { id },
      data: { status: 'EM_ANDAMENTO', dataSaida: new Date() },
      include: { veiculo: { select: { placa: true } }, motorista: { select: { nome: true } } },
    });

    this.logger.log(`Rota ${id} iniciada`);
    return { success: true, data: updated };
  }

  async concluir(id: string, dto: ConcluirRotaDto) {
    const rota = await this.findOne(id);
    if (rota.data.status !== 'EM_ANDAMENTO') {
      throw new BadRequestException('Apenas rotas em andamento podem ser concluídas');
    }

    const veiculo = await this.prisma.veiculo.findUnique({ where: { id: rota.data.veiculoId } });
    if (!veiculo) throw new NotFoundException('Veículo não encontrado');
    const kmAnterior = Number(veiculo.kmAtual);
    const kmPercorrido = dto.kmFinal - kmAnterior;

    const [updated] = await Promise.all([
      this.prisma.rota.update({
        where: { id },
        data: { status: 'CONCLUIDA', dataChegada: dto.dataChegada ? new Date(dto.dataChegada) : new Date() },
        include: { veiculo: { select: { placa: true } }, motorista: { select: { nome: true } } },
      }),
      this.prisma.veiculo.update({ where: { id: rota.data.veiculoId }, data: { kmAtual: dto.kmFinal } }),
      this.prisma.kmRegistro.create({
        data: {
          veiculoId: rota.data.veiculoId,
          motoristaId: rota.data.motoristaId,
          data: new Date(),
          kmAnterior,
          kmAtual: dto.kmFinal,
          kmPercorrido: kmPercorrido > 0 ? kmPercorrido : 0,
          tipo: 'VIAGEM',
          observacoes: `Conclusão da rota: ${rota.data.descricao}`,
        },
      }),
    ]);

    this.logger.log(`Rota ${id} concluída - KM percorrido: ${kmPercorrido}`);
    return { success: true, data: updated };
  }
}
