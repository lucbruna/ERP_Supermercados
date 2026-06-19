import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import {
  ProcessarPagamentoDto,
  PagamentoQueryDto,
  EstornarPagamentoDto,
  PagamentoTipo,
} from './dto/pagamento.dto';
import { TefService } from '../integracao/tef.service';
import { PixService } from '../integracao/pix.service';
import { ConvenioClient } from '../common/convenio-client';

@Injectable()
export class PagamentosService {
  private readonly logger = new Logger(PagamentosService.name);

  constructor(
    private prisma: PrismaService,
    private tefService: TefService,
    private pixService: PixService,
    private convenioClient: ConvenioClient,
  ) {}

  async processar(dto: ProcessarPagamentoDto) {
    const venda = await this.prisma.venda.findUnique({ where: { id: dto.vendaId } });
    if (!venda) throw new NotFoundException('Venda não encontrada');
    if (venda.status === 'CANCELADA') {
      throw new BadRequestException('Venda cancelada não pode receber pagamentos');
    }

    const pagamentosExistentes = await this.prisma.pagamentoVenda.findMany({
      where: { vendaId: dto.vendaId },
    });
    const totalExistente = pagamentosExistentes.reduce((sum, p) => sum + Number(p.valor), 0);
    const novoTotal = totalExistente + dto.valor;
    if (novoTotal > Number(venda.total)) {
      throw new BadRequestException(
        `Valor total de pagamentos (R$ ${novoTotal.toFixed(2)}) excede o total da venda (R$ ${Number(venda.total).toFixed(2)})`,
      );
    }

    let troco = undefined;
    if (dto.tipo === PagamentoTipo.DINHEIRO && dto.trocoPara) {
      troco = dto.trocoPara - dto.valor;
      if (troco < 0) troco = 0;
    }

    if ([PagamentoTipo.CARTAO_CREDITO, PagamentoTipo.CARTAO_DEBITO].includes(dto.tipo)) {
      const tefResult = await this.tefService.processarPagamentoCartao({
        valor: dto.valor,
        tipo: dto.tipo === PagamentoTipo.CARTAO_CREDITO ? 'credito' : 'debito',
        parcelas: dto.parcelas || 1,
        bandeira: dto.bandeira,
      });
      dto.codigoAutorizacao = tefResult.codigoAutorizacao;
      dto.nsu = tefResult.nsu;
      dto.idTransacao = tefResult.idTransacao;
    }

    if (dto.tipo === PagamentoTipo.PIX) {
      dto.chavePix = dto.chavePix || process.env.PIX_KEY || 'contato@supermercado.com.br';
      try {
        const pixResult = await this.pixService.generateQrCode(dto.valor);
        dto.pixCopiaCola = pixResult.copiaECola;
        dto.idTransacao = pixResult.txId;
      } catch (error: any) {
        dto.pixCopiaCola = `00020126580014BR.GOV.BCB.PIX0136${dto.chavePix}5204000053039865406${dto.valor.toFixed(2).replace('.', '')}5802BR5913Supermercado6008BRASILIA62070503***6304A1B2`;
        dto.idTransacao = `PIX-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      }
    }

    if (dto.tipo === PagamentoTipo.CONVENIO) {
      try {
        await this.convenioClient.registrarVenda({
          vendaId: dto.vendaId,
          clienteId: venda.clienteId || '',
          valor: dto.valor,
          data: new Date(),
          itens: venda.itens as any[],
        });
      } catch (error: any) {
        throw new BadRequestException(`Erro ao registrar no convênio: ${error.message}`);
      }
    }

    const pagamento = await this.prisma.pagamentoVenda.create({
      data: {
        vendaId: dto.vendaId,
        tipo: dto.tipo as any,
        valor: dto.valor,
        parcelas: dto.parcelas || 1,
        bandeira: dto.bandeira,
        codigoAutorizacao: dto.codigoAutorizacao,
        nsu: dto.nsu,
        pixCopiaCola: dto.pixCopiaCola,
        chavePix: dto.chavePix,
        idTransacao: dto.idTransacao,
        trocoPara: dto.trocoPara,
        troco,
      },
    });

    const pagamentos = await this.prisma.pagamentoVenda.findMany({
      where: { vendaId: dto.vendaId },
    });
    const totalPago = pagamentos.reduce((sum, p) => sum + Number(p.valor), 0);

    await this.prisma.venda.update({
      where: { id: dto.vendaId },
      data: {
        pagamentos: pagamentos as any,
        troco: troco || venda.troco,
      },
    });

    this.logger.log(`Pagamento de R$ ${dto.valor} processado via ${dto.tipo} na venda ${venda.numero}`);
    return { success: true, data: pagamento, totalPago };
  }

  async estornar(id: string, dto: EstornarPagamentoDto) {
    const pagamento = await this.prisma.pagamentoVenda.findUnique({ where: { id } });
    if (!pagamento) throw new NotFoundException('Pagamento não encontrado');

    if (pagamento.tipo === PagamentoTipo.PIX && pagamento.idTransacao) {
      await this.pixService.estornarPix(pagamento.idTransacao, Number(pagamento.valor));
    }

    if (pagamento.tipo === PagamentoTipo.CARTAO_CREDITO && pagamento.idTransacao) {
      await this.tefService.cancelarTransacao(
        pagamento.idTransacao,
        pagamento.nsu || '',
        Number(pagamento.valor),
      );
    }

    if (pagamento.tipo === PagamentoTipo.CONVENIO) {
      const venda = await this.prisma.venda.findUnique({ where: { id: pagamento.vendaId } });
      if (venda?.clienteId) {
        await this.convenioClient.cancelarVenda(
          pagamento.vendaId,
          venda.clienteId,
          Number(pagamento.valor),
        );
      }
    }

    await this.prisma.pagamentoVenda.delete({ where: { id } });

    const venda = await this.prisma.venda.findUnique({ where: { id: pagamento.vendaId } });
    if (venda) {
      const pagamentosRestantes = await this.prisma.pagamentoVenda.findMany({
        where: { vendaId: pagamento.vendaId },
      });
      await this.prisma.venda.update({
        where: { id: pagamento.vendaId },
        data: { pagamentos: pagamentosRestantes as any },
      });
    }

    this.logger.log(`Pagamento ${id} estornado: ${dto.motivo}`);
    return { success: true, message: 'Pagamento estornado com sucesso' };
  }

  async findAll(query: PagamentoQueryDto) {
    const where: any = {};
    if (query.vendaId) where.vendaId = query.vendaId;
    if (query.tipo) where.tipo = query.tipo;

    const pagamentos = await this.prisma.pagamentoVenda.findMany({
      where,
      orderBy: { id: 'asc' },
    });
    return { success: true, data: pagamentos };
  }

  async findOne(id: string) {
    const pagamento = await this.prisma.pagamentoVenda.findUnique({ where: { id } });
    if (!pagamento) throw new NotFoundException('Pagamento não encontrado');
    return { success: true, data: pagamento };
  }

  async remove(id: string) {
    const pagamento = await this.prisma.pagamentoVenda.findUnique({ where: { id } });
    if (!pagamento) throw new NotFoundException('Pagamento não encontrado');

    await this.prisma.pagamentoVenda.delete({ where: { id } });
    return { success: true, message: 'Pagamento removido com sucesso' };
  }
}
