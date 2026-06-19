import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateBancoHorasDto, UpdateBancoHorasDto, BancoHorasQueryDto, CreditarHorasDto, DebitarHorasDto } from './dto/create-banco-horas.dto';

@Injectable()
export class BancoHorasService {
  private readonly logger = new Logger(BancoHorasService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateBancoHorasDto) {
    const existente = await this.prisma.bancoHoras.findUnique({
      where: {
        funcionarioId_mes_ano: {
          funcionarioId: dto.funcionarioId,
          mes: dto.mes,
          ano: dto.ano,
        },
      },
    });
    if (existente) throw new ConflictException('Banco de horas já existe para este período');

    const banco = await this.prisma.bancoHoras.create({ data: dto });
    this.logger.log(`Banco de horas criado: ${dto.funcionarioId} - ${dto.mes}/${dto.ano}`);
    return { success: true, data: banco };
  }

  async findAll(query: BancoHorasQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.funcionarioId) where.funcionarioId = query.funcionarioId;
    if (query.mes) where.mes = query.mes;
    if (query.ano) where.ano = query.ano;

    const [data, total] = await Promise.all([
      this.prisma.bancoHoras.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ ano: 'desc' }, { mes: 'desc' }],
        include: { funcionario: { select: { id: true, nome: true, matricula: true } } },
      }),
      this.prisma.bancoHoras.count({ where }),
    ]);

    return {
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const banco = await this.prisma.bancoHoras.findUnique({
      where: { id },
      include: { funcionario: { select: { id: true, nome: true, matricula: true } } },
    });
    if (!banco) throw new NotFoundException('Registro de banco de horas não encontrado');
    return { success: true, data: banco };
  }

  async findByPeriodo(funcionarioId: string, mes: number, ano: number) {
    const banco = await this.prisma.bancoHoras.findUnique({
      where: { funcionarioId_mes_ano: { funcionarioId, mes, ano } },
    });
    if (!banco) throw new NotFoundException('Banco de horas não encontrado para este período');
    return { success: true, data: banco };
  }

  async update(id: string, dto: UpdateBancoHorasDto) {
    await this.findOne(id);
    const updated = await this.prisma.bancoHoras.update({ where: { id }, data: dto });
    return { success: true, data: updated };
  }

  async creditarHoras(dto: CreditarHorasDto) {
    const funcionario = await this.prisma.funcionario.findUnique({
      where: { id: dto.funcionarioId },
    });
    if (!funcionario) throw new NotFoundException('Funcionário não encontrado');

    const banco = await this.prisma.bancoHoras.upsert({
      where: {
        funcionarioId_mes_ano: {
          funcionarioId: dto.funcionarioId,
          mes: dto.mes,
          ano: dto.ano,
        },
      },
      update: {
        horasCreditadas: { increment: dto.horas },
        saldoAtual: { increment: dto.horas },
      },
      create: {
        funcionarioId: dto.funcionarioId,
        mes: dto.mes,
        ano: dto.ano,
        saldoAnterior: 0,
        horasCreditadas: dto.horas,
        horasDebitadas: 0,
        saldoAtual: dto.horas,
      },
    });

    this.logger.log(`Horas creditadas: ${dto.funcionarioId} - ${dto.horas}h`);
    return { success: true, data: banco };
  }

  async debitarHoras(dto: DebitarHorasDto) {
    const banco = await this.prisma.bancoHoras.findUnique({
      where: {
        funcionarioId_mes_ano: {
          funcionarioId: dto.funcionarioId,
          mes: dto.mes,
          ano: dto.ano,
        },
      },
    });

    if (!banco) throw new NotFoundException('Banco de horas não encontrado para este período');
    if (Number(banco.saldoAtual) < dto.horas) {
      throw new ConflictException('Saldo insuficiente no banco de horas');
    }

    const updated = await this.prisma.bancoHoras.update({
      where: {
        funcionarioId_mes_ano: {
          funcionarioId: dto.funcionarioId,
          mes: dto.mes,
          ano: dto.ano,
        },
      },
      data: {
        horasDebitadas: { increment: dto.horas },
        saldoAtual: { decrement: dto.horas },
      },
    });

    this.logger.log(`Horas debitadas: ${dto.funcionarioId} - ${dto.horas}h`);
    return { success: true, data: updated };
  }

  async saldoAtual(funcionarioId: string) {
    const ultimo = await this.prisma.bancoHoras.findFirst({
      where: { funcionarioId },
      orderBy: [{ ano: 'desc' }, { mes: 'desc' }],
    });

    return {
      success: true,
      data: {
        funcionarioId,
        saldoAtual: ultimo ? Number(ultimo.saldoAtual) : 0,
        ultimoRegistro: ultimo,
      },
    };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.bancoHoras.delete({ where: { id } });
    return { success: true, message: 'Registro de banco de horas removido' };
  }
}
