import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateDeliveryDto, UpdateDeliveryDto, DeliveryQueryDto } from './dto/delivery.dto';

@Injectable()
export class DeliveryService {
  private readonly logger = new Logger(DeliveryService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDeliveryDto) {
    return this.prisma.delivery.create({
      data: {
        companyId: dto.companyId,
        unidadeId: dto.unidadeId,
        vendaId: dto.vendaId,
        clienteId: dto.clienteId,
        clienteNome: dto.clienteNome,
        clienteTelefone: dto.clienteTelefone,
        endereco: dto.endereco,
        observacao: dto.observacao,
        taxaEntrega: dto.taxaEntrega ?? 0,
      },
    });
  }

  async findAll(query: DeliveryQueryDto) {
    const { pagina = 1, limite = 10, companyId, status } = query;
    const skip = (pagina - 1) * limite;
    const where: any = {};
    if (companyId) where.companyId = companyId;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.delivery.findMany({ where, skip, take: limite, orderBy: { dataPedido: 'desc' } }),
      this.prisma.delivery.count({ where }),
    ]);
    return { data, total, pagina, limite, totalPaginas: Math.ceil(total / limite) };
  }

  async findOne(id: string) {
    const delivery = await this.prisma.delivery.findUnique({ where: { id } });
    if (!delivery) throw new NotFoundException('Delivery não encontrado');
    return delivery;
  }

  async update(id: string, dto: UpdateDeliveryDto) {
    await this.findOne(id);
    const data: any = { ...dto };
    if (dto.status === 'SAIU_PARA_ENTREGA') data.dataSaida = new Date();
    if (dto.status === 'ENTREGUE') data.dataEntrega = new Date();
    return this.prisma.delivery.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.delivery.delete({ where: { id } });
  }
}
