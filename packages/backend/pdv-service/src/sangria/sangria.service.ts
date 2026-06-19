import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import {
  CreateSangriaDto,
  CreateSuprimentoDto,
  SangriaQueryDto,
  SuprimentoQueryDto,
} from './dto/sangria.dto';

@Injectable()
export class SangriaService {
  private readonly logger = new Logger(SangriaService.name);

  constructor(private prisma: PrismaService) {}

  async criarSangria(dto: CreateSangriaDto) {
    const pdv = await this.prisma.pDV.findUnique({ where: { id: dto.pdvId } });
    if (!pdv) throw new NotFoundException('PDV não encontrado');

    const sangria = await this.prisma.sangria.create({
      data: {
        pdvId: dto.pdvId,
        valor: dto.valor,
        motivo: dto.motivo,
        operadorId: dto.operadorId,
      },
    });

    this.logger.log(`Sangria de R$ ${dto.valor} no PDV ${pdv.codigo}: ${dto.motivo}`);
    return { success: true, data: sangria };
  }

  async criarSuprimento(dto: CreateSuprimentoDto) {
    const pdv = await this.prisma.pDV.findUnique({ where: { id: dto.pdvId } });
    if (!pdv) throw new NotFoundException('PDV não encontrado');

    const suprimento = await this.prisma.suprimento.create({
      data: {
        pdvId: dto.pdvId,
        valor: dto.valor,
        origem: dto.origem,
        operadorId: dto.operadorId,
      },
    });

    this.logger.log(`Suprimento de R$ ${dto.valor} no PDV ${pdv.codigo}: ${dto.origem}`);
    return { success: true, data: suprimento };
  }

  async listarSangrias(query: SangriaQueryDto) {
    const where: any = {};
    if (query.pdvId) where.pdvId = query.pdvId;
    if (query.dataInicio || query.dataFim) {
      where.data = {};
      if (query.dataInicio) where.data.gte = query.dataInicio;
      if (query.dataFim) where.data.lte = query.dataFim;
    }

    const sangrias = await this.prisma.sangria.findMany({
      where,
      orderBy: { data: 'desc' },
    });
    return { success: true, data: sangrias };
  }

  async listarSuprimentos(query: SuprimentoQueryDto) {
    const where: any = {};
    if (query.pdvId) where.pdvId = query.pdvId;
    if (query.dataInicio || query.dataFim) {
      where.data = {};
      if (query.dataInicio) where.data.gte = query.dataInicio;
      if (query.dataFim) where.data.lte = query.dataFim;
    }

    const suprimentos = await this.prisma.suprimento.findMany({
      where,
      orderBy: { data: 'desc' },
    });
    return { success: true, data: suprimentos };
  }

  async findSangriaById(id: string) {
    const sangria = await this.prisma.sangria.findUnique({ where: { id } });
    if (!sangria) throw new NotFoundException('Sangria não encontrada');
    return { success: true, data: sangria };
  }

  async findSuprimentoById(id: string) {
    const suprimento = await this.prisma.suprimento.findUnique({ where: { id } });
    if (!suprimento) throw new NotFoundException('Suprimento não encontrado');
    return { success: true, data: suprimento };
  }

  async getSaldo(pdvId: string) {
    const pdv = await this.prisma.pDV.findUnique({ where: { id: pdvId } });
    if (!pdv) throw new NotFoundException('PDV não encontrado');

    const vendas = await this.prisma.venda.findMany({
      where: { pdvId, status: 'FINALIZADA' },
    });
    const totalVendas = vendas.reduce((sum, v) => sum + Number(v.total), 0);

    const sangrias = await this.prisma.sangria.findMany({ where: { pdvId } });
    const totalSangrias = sangrias.reduce((sum, s) => sum + Number(s.valor), 0);

    const suprimentos = await this.prisma.suprimento.findMany({ where: { pdvId } });
    const totalSuprimentos = suprimentos.reduce((sum, s) => sum + Number(s.valor), 0);

    const saldoAbertura = Number(pdv.saldoAbertura || 0);
    const saldoAtual = saldoAbertura + totalSuprimentos + totalVendas - totalSangrias;

    return {
      success: true,
      data: {
        pdvId,
        saldoAbertura,
        totalVendas,
        totalSuprimentos,
        totalSangrias,
        saldoAtual,
      },
    };
  }
}
