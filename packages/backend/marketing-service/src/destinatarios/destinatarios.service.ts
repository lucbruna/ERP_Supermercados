import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateDestinatarioDto, CreateDestinatariosBatchDto, DestinatarioQueryDto } from './dto/create-destinatario.dto';

@Injectable()
export class DestinatariosService {
  private readonly logger = new Logger(DestinatariosService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDestinatarioDto) {
    const destinatario = await this.prisma.campanhaDestinatario.create({
      data: {
        campanhaId: dto.campanhaId,
        clienteId: dto.clienteId,
        nome: dto.nome,
        celular: dto.celular,
        email: dto.email,
      },
    });

    this.logger.log(`Destinatário adicionado: ${destinatario.id}`);
    return { success: true, data: destinatario };
  }

  async createBatch(dto: CreateDestinatariosBatchDto) {
    const data = dto.destinatarios.map((dest) => ({
      campanhaId: dto.campanhaId,
      clienteId: dest.clienteId,
      nome: dest.nome,
      celular: dest.celular,
      email: dest.email,
    }));

    await this.prisma.campanhaDestinatario.createMany({ data });

    this.logger.log(`${data.length} destinatários adicionados em lote`);
    return { success: true, message: `${data.length} destinatários adicionados` };
  }

  async findAll(query: DestinatarioQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.enviado !== undefined) where.enviado = query.enviado;
    if (query.aberto !== undefined) where.aberto = query.aberto;
    if (query.clicado !== undefined) where.clicado = query.clicado;

    const [data, total] = await Promise.all([
      this.prisma.campanhaDestinatario.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.campanhaDestinatario.count({ where }),
    ]);

    return {
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const destinatario = await this.prisma.campanhaDestinatario.findUnique({
      where: { id },
      include: { campanha: true },
    });
    if (!destinatario) throw new NotFoundException('Destinatário não encontrado');
    return { success: true, data: destinatario };
  }

  async update(id: string, dto: Partial<CreateDestinatarioDto>) {
    await this.findOne(id);
    const updated = await this.prisma.campanhaDestinatario.update({
      where: { id },
      data: dto,
    });
    return { success: true, data: updated };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.campanhaDestinatario.delete({ where: { id } });
    return { success: true, message: 'Destinatário removido com sucesso' };
  }

  async markEnviado(id: string) {
    return this.prisma.campanhaDestinatario.update({
      where: { id },
      data: { enviado: true, dataEnvio: new Date() },
    });
  }

  async marcarAbertura(id: string) {
    await this.findOne(id);
    const updated = await this.prisma.campanhaDestinatario.update({
      where: { id },
      data: { aberto: true, dataAbertura: new Date() },
    });
    return { success: true, data: updated };
  }

  async marcarClique(id: string) {
    await this.findOne(id);
    const updated = await this.prisma.campanhaDestinatario.update({
      where: { id },
      data: { clicado: true, dataClique: new Date() },
    });
    return { success: true, data: updated };
  }
}
