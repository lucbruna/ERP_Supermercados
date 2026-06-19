import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateMultaDto, UpdateMultaDto, PagarMultaDto, MultaQueryDto } from './dto/multas.dto';

@Injectable()
export class MultasService {
  private readonly logger = new Logger(MultasService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateMultaDto) {
    const multa = await this.prisma.multa.create({ data: dto });
    this.logger.log(`Multa registrada: ${dto.orgao} - R$${dto.valor}`);
    return { success: true, data: multa };
  }

  async findAll(query: MultaQueryDto) {
    const where: any = {};
    if (query.veiculoId) where.veiculoId = query.veiculoId;
    if (query.status) where.status = query.status;

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.multa.findMany({
        where,
        skip,
        take: limit,
        orderBy: { data: 'desc' },
        include: { veiculo: { select: { placa: true } } },
      }),
      this.prisma.multa.count({ where }),
    ]);

    return { success: true, data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const multa = await this.prisma.multa.findUnique({
      where: { id },
      include: { veiculo: { select: { placa: true, marca: true, modelo: true } } },
    });
    if (!multa) throw new NotFoundException('Multa não encontrada');
    return { success: true, data: multa };
  }

  async update(id: string, dto: UpdateMultaDto) {
    await this.findOne(id);
    const updated = await this.prisma.multa.update({ where: { id }, data: dto });
    return { success: true, data: updated };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.multa.delete({ where: { id } });
    return { success: true, message: 'Multa removida' };
  }

  async pagar(id: string, dto: PagarMultaDto) {
    const multa = await this.findOne(id);
    if (multa.data.status === 'PAGA') {
      throw new NotFoundException('Multa já está paga');
    }

    const data: any = { status: 'PAGA', dataPagamento: new Date(dto.dataPagamento) };
    if (dto.valor) data.valor = dto.valor;

    const updated = await this.prisma.multa.update({ where: { id }, data });
    this.logger.log(`Multa ${id} paga`);
    return { success: true, data: updated };
  }
}
