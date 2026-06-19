import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateFolhaPagamentoDto, UpdateFolhaPagamentoDto, FolhaQueryDto, CalcularFolhaDto } from './dto/create-folha.dto';

@Injectable()
export class FolhaService {
  private readonly logger = new Logger(FolhaService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateFolhaPagamentoDto) {
    const existente = await this.prisma.folhaPagamento.findUnique({
      where: {
        funcionarioId_mes_ano: {
          funcionarioId: dto.funcionarioId,
          mes: dto.mes,
          ano: dto.ano,
        },
      },
    });
    if (existente) throw new ConflictException('Folha já calculada para este período');

    const folha = await this.prisma.folhaPagamento.create({
      data: {
        ...dto,
        dataPagamento: dto.dataPagamento ? new Date(dto.dataPagamento) : null,
      },
    });

    this.logger.log(`Folha criada: ${folha.funcionarioId} - ${dto.mes}/${dto.ano}`);
    return { success: true, data: folha };
  }

  async findAll(query: FolhaQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.funcionarioId) where.funcionarioId = query.funcionarioId;
    if (query.mes) where.mes = query.mes;
    if (query.ano) where.ano = query.ano;
    if (query.status) where.status = query.status;

    const [data, total] = await Promise.all([
      this.prisma.folhaPagamento.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ ano: 'desc' }, { mes: 'desc' }],
        include: { funcionario: { select: { id: true, nome: true, matricula: true } } },
      }),
      this.prisma.folhaPagamento.count({ where }),
    ]);

    return {
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const folha = await this.prisma.folhaPagamento.findUnique({
      where: { id },
      include: { funcionario: { select: { id: true, nome: true, matricula: true, cargo: true, departamento: true } } },
    });
    if (!folha) throw new NotFoundException('Folha de pagamento não encontrada');
    return { success: true, data: folha };
  }

  async update(id: string, dto: UpdateFolhaPagamentoDto) {
    await this.findOne(id);
    const data: any = { ...dto };
    if (dto.dataPagamento) data.dataPagamento = new Date(dto.dataPagamento);

    const updated = await this.prisma.folhaPagamento.update({ where: { id }, data });
    return { success: true, data: updated };
  }

  async calcular(dto: CalcularFolhaDto) {
    const funcionario = await this.prisma.funcionario.findUnique({
      where: { id: dto.funcionarioId },
    });
    if (!funcionario) throw new NotFoundException('Funcionário não encontrado');

    const salarioBase = Number(funcionario.salario);
    const proventos = dto.proventosAdicionais || [];
    const descontos = dto.descontosAdicionais || [];

    const totalProventos = proventos.reduce((acc: number, p: any) => acc + (p.valor || 0), 0);
    const totalDescontos = descontos.reduce((acc: number, d: any) => acc + (d.valor || 0), 0);

    const salarioBruto = salarioBase + totalProventos;

    const inss = this.calcularINSS(salarioBruto);
    const irrf = this.calcularIRRF(salarioBruto - inss);
    const fgts = salarioBruto * 0.08;
    const salarioLiquido = salarioBruto - inss - irrf - totalDescontos;

    const folha = await this.prisma.folhaPagamento.upsert({
      where: {
        funcionarioId_mes_ano: {
          funcionarioId: dto.funcionarioId,
          mes: dto.mes,
          ano: dto.ano,
        },
      },
      update: {
        salarioBase,
        proventos,
        descontos,
        salarioBruto,
        salarioLiquido,
        fgts,
        inss,
        irrf,
        status: 'CALCULADA',
      },
      create: {
        funcionarioId: dto.funcionarioId,
        mes: dto.mes,
        ano: dto.ano,
        salarioBase,
        proventos,
        descontos,
        salarioBruto,
        salarioLiquido,
        fgts,
        inss,
        irrf,
        status: 'CALCULADA',
      },
    });

    this.logger.log(`Folha calculada: ${dto.funcionarioId} - ${dto.mes}/${dto.ano}`);
    return {
      success: true,
      data: folha,
      detalhes: { salarioBase, totalProventos, totalDescontos, salarioBruto, inss, irrf, fgts, salarioLiquido },
    };
  }

  async fechar(id: string) {
    const folha = await this.prisma.folhaPagamento.findUnique({ where: { id } });
    if (!folha) throw new NotFoundException('Folha não encontrada');
    if (folha.status !== 'CALCULADA') throw new ConflictException('Folha deve estar com status CALCULADA');

    const updated = await this.prisma.folhaPagamento.update({
      where: { id },
      data: { status: 'FECHADA' },
    });
    return { success: true, data: updated };
  }

  async pagar(id: string, dataPagamento?: string) {
    const folha = await this.prisma.folhaPagamento.findUnique({ where: { id } });
    if (!folha) throw new NotFoundException('Folha não encontrada');
    if (folha.status !== 'FECHADA') throw new ConflictException('Folha deve estar com status FECHADA');

    const updated = await this.prisma.folhaPagamento.update({
      where: { id },
      data: {
        status: 'PAGA',
        dataPagamento: dataPagamento ? new Date(dataPagamento) : new Date(),
      },
    });
    return { success: true, data: updated };
  }

  async cancelar(id: string) {
    const folha = await this.prisma.folhaPagamento.findUnique({ where: { id } });
    if (!folha) throw new NotFoundException('Folha não encontrada');
    if (folha.status === 'CANCELADA') throw new ConflictException('Folha já cancelada');

    const updated = await this.prisma.folhaPagamento.update({
      where: { id },
      data: { status: 'CANCELADA' },
    });
    return { success: true, data: updated };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.folhaPagamento.delete({ where: { id } });
    return { success: true, message: 'Folha de pagamento removida' };
  }

  private calcularINSS(salario: number): number {
    if (salario <= 1412.00) return salario * 0.075;
    if (salario <= 2666.68) return salario * 0.09;
    if (salario <= 4000.03) return salario * 0.12;
    if (salario <= 7786.02) return salario * 0.14;
    return 7786.02 * 0.14;
  }

  private calcularIRRF(base: number): number {
    if (base <= 2112.00) return 0;
    if (base <= 2826.65) return base * 0.075 - 158.40;
    if (base <= 3751.05) return base * 0.15 - 370.40;
    if (base <= 4664.68) return base * 0.225 - 651.73;
    return base * 0.275 - 884.96;
  }
}
