import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { TipoFaturamento, ConvenioStatus } from '@prisma/client';
import { CreateConvenioDto, UpdateConvenioDto, ConvenioQueryDto } from './dto/convenios.dto';

@Injectable()
export class ConveniosService {
  private readonly logger = new Logger(ConveniosService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateConvenioDto) {
    const existing = await this.prisma.convenio.findUnique({ where: { codigo: dto.codigo } });
    if (existing) throw new ConflictException('Código de convênio já existe');

    const convenio = await this.prisma.convenio.create({
      data: {
        companyId: dto.companyId,
        unidadeId: dto.unidadeId,
        codigo: dto.codigo,
        nome: dto.nome,
        cnpj: dto.cnpj,
        contato: dto.contato,
        telefone: dto.telefone,
        email: dto.email,
        endereco: dto.endereco || {},
        limiteGlobal: dto.limiteGlobal ?? 0,
        descontoPadrao: dto.descontoPadrao ?? 0,
        prazoPagamento: dto.prazoPagamento ?? 30,
        tipoFaturamento: (dto.tipoFaturamento || 'MENSAL') as TipoFaturamento,
        diaFechamento: dto.diaFechamento ?? 1,
        observacao: dto.observacao,
      },
    });

    this.logger.log(`Convênio criado: ${convenio.nome} (${convenio.codigo})`);
    return { success: true, data: convenio };
  }

  async findAll(query: ConvenioQueryDto) {
    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.search) {
      where.OR = [
        { nome: { contains: query.search, mode: 'insensitive' } },
        { codigo: { contains: query.search, mode: 'insensitive' } },
        { cnpj: { contains: query.search } },
      ];
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.convenio.findMany({ where, skip, take: limit, orderBy: { nome: 'asc' } }),
      this.prisma.convenio.count({ where }),
    ]);

    return {
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const convenio = await this.prisma.convenio.findUnique({
      where: { id },
      include: {
        contratos: { where: { status: 'ATIVO' } },
        _count: { select: { faturas: true, vendas: true } },
      },
    });
    if (!convenio) throw new NotFoundException('Convênio não encontrado');
    return { success: true, data: convenio };
  }

  async dashboard(id: string) {
    const convenio = await this.prisma.convenio.findUnique({ where: { id } });
    if (!convenio) throw new NotFoundException('Convênio não encontrado');

    const [faturasAbertas, faturasVencidas, vendasMes, totalFaturas] = await Promise.all([
      this.prisma.faturaConvenio.findMany({ where: { convenioId: id, status: 'PENDENTE' } }),
      this.prisma.faturaConvenio.findMany({ where: { convenioId: id, status: 'ATRASADA' } }),
      this.prisma.vendaConvenio.findMany({
        where: { convenioId: id, dataVenda: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } },
      }),
      this.prisma.faturaConvenio.aggregate({ where: { convenioId: id }, _sum: { valorTotal: true, valorPago: true } }),
    ]);

    return {
      success: true,
      data: {
        convenio,
        resumo: {
          limiteDisponivel: Number(convenio.limiteGlobal) - Number(convenio.saldoUtilizado),
          saldoUtilizado: convenio.saldoUtilizado,
          faturasAbertas: faturasAbertas.length,
          faturasVencidas: faturasVencidas.length,
          vendasMes: vendasMes.length,
          totalFaturado: totalFaturas._sum.valorTotal || 0,
          totalPago: totalFaturas._sum.valorPago || 0,
        },
        faturasAbertas,
        faturasVencidas,
      },
    };
  }

  async update(id: string, dto: UpdateConvenioDto) {
    await this.findOne(id);
    const updated = await this.prisma.convenio.update({
      where: { id },
      data: {
        ...(dto.nome !== undefined && { nome: dto.nome }),
        ...(dto.cnpj !== undefined && { cnpj: dto.cnpj }),
        ...(dto.contato !== undefined && { contato: dto.contato }),
        ...(dto.telefone !== undefined && { telefone: dto.telefone }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.limiteGlobal !== undefined && { limiteGlobal: dto.limiteGlobal }),
        ...(dto.descontoPadrao !== undefined && { descontoPadrao: dto.descontoPadrao }),
        ...(dto.prazoPagamento !== undefined && { prazoPagamento: dto.prazoPagamento }),
        ...(dto.tipoFaturamento !== undefined && { tipoFaturamento: dto.tipoFaturamento as TipoFaturamento }),
        ...(dto.diaFechamento !== undefined && { diaFechamento: dto.diaFechamento }),
        ...(dto.observacao !== undefined && { observacao: dto.observacao }),
        ...(dto.status !== undefined && { status: dto.status as ConvenioStatus }),
      },
    });
    return { success: true, data: updated };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.convenio.update({ where: { id }, data: { status: 'INATIVO' } });
    return { success: true, message: 'Convênio desativado' };
  }
}
