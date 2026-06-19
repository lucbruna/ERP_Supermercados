import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateFeriasDto, UpdateFeriasDto, FeriasQueryDto } from './dto/create-ferias.dto';

@Injectable()
export class FeriasService {
  private readonly logger = new Logger(FeriasService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateFeriasDto) {
    const funcionario = await this.prisma.funcionario.findUnique({
      where: { id: dto.funcionarioId },
    });
    if (!funcionario) throw new NotFoundException('Funcionário não encontrado');

    const dataInicio = new Date(dto.dataInicio);
    const dataFim = new Date(dto.dataFim);

    if (dataFim <= dataInicio) {
      throw new BadRequestException('Data fim deve ser posterior à data início');
    }

    const conflitos = await this.prisma.ferias.findFirst({
      where: {
        funcionarioId: dto.funcionarioId,
        status: { in: ['AGENDADA', 'CONCEDIDA'] },
        OR: [
          { dataInicio: { lte: dataFim }, dataFim: { gte: dataInicio } },
        ],
      },
    });
    if (conflitos) throw new BadRequestException('Período de férias conflita com outro agendamento');

    const ferias = await this.prisma.ferias.create({
      data: {
        funcionarioId: dto.funcionarioId,
        dataInicio,
        dataFim,
        dataPagamento: dto.dataPagamento ? new Date(dto.dataPagamento) : null,
        dias: dto.dias,
        abonoPecuniario: dto.abonoPecuniario || false,
        status: dto.status || 'AGENDADA',
      },
    });

    await this.prisma.funcionario.update({
      where: { id: dto.funcionarioId },
      data: { status: 'FERIAS' },
    });

    this.logger.log(`Férias criadas: ${dto.funcionarioId} - ${dto.dias} dias`);
    return { success: true, data: ferias };
  }

  async findAll(query: FeriasQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.funcionarioId) where.funcionarioId = query.funcionarioId;
    if (query.status) where.status = query.status;

    const [data, total] = await Promise.all([
      this.prisma.ferias.findMany({
        where,
        skip,
        take: limit,
        orderBy: { dataInicio: 'desc' },
        include: { funcionario: { select: { id: true, nome: true, matricula: true } } },
      }),
      this.prisma.ferias.count({ where }),
    ]);

    return {
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const ferias = await this.prisma.ferias.findUnique({
      where: { id },
      include: { funcionario: { select: { id: true, nome: true, matricula: true, cargo: true, departamento: true } } },
    });
    if (!ferias) throw new NotFoundException('Registro de férias não encontrado');
    return { success: true, data: ferias };
  }

  async update(id: string, dto: UpdateFeriasDto) {
    await this.findOne(id);
    const data: any = { ...dto };
    if (dto.dataInicio) data.dataInicio = new Date(dto.dataInicio);
    if (dto.dataFim) data.dataFim = new Date(dto.dataFim);
    if (dto.dataPagamento) data.dataPagamento = new Date(dto.dataPagamento);

    const updated = await this.prisma.ferias.update({ where: { id }, data });
    return { success: true, data: updated };
  }

  async conceder(id: string) {
    const ferias = await this.prisma.ferias.findUnique({ where: { id } });
    if (!ferias) throw new NotFoundException('Férias não encontradas');
    if (ferias.status !== 'AGENDADA') throw new BadRequestException('Férias devem estar com status AGENDADA');

    const updated = await this.prisma.ferias.update({
      where: { id },
      data: { status: 'CONCEDIDA' },
    });
    return { success: true, data: updated };
  }

  async cancelar(id: string) {
    const ferias = await this.prisma.ferias.findUnique({
      where: { id },
      include: { funcionario: true },
    });
    if (!ferias) throw new NotFoundException('Férias não encontradas');
    if (ferias.status === 'CANCELADA') throw new BadRequestException('Férias já canceladas');

    await this.prisma.ferias.update({
      where: { id },
      data: { status: 'CANCELADA' },
    });

    if (ferias.funcionario.status === 'FERIAS') {
      await this.prisma.funcionario.update({
        where: { id: ferias.funcionarioId },
        data: { status: 'ATIVO' },
      });
    }

    return { success: true, message: 'Férias canceladas' };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.ferias.delete({ where: { id } });
    return { success: true, message: 'Registro de férias removido' };
  }
}
