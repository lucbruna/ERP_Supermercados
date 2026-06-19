import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import {
  CreateVendaDto,
  FinalizarVendaDto,
  CancelarVendaDto,
  VendaQueryDto,
} from './dto/venda.dto';
import { VendaStatus, PdvStatus } from '@prisma/client';
import { NfceService } from '../integracao/nfce.service';
import { InventoryClient } from '../common/inventory-client';
import { CrmClient } from '../common/crm-client';

@Injectable()
export class VendasService {
  private readonly logger = new Logger(VendasService.name);

  constructor(
    private prisma: PrismaService,
    private nfceService: NfceService,
    private inventoryClient: InventoryClient,
    private crmClient: CrmClient,
  ) {}

  async create(dto: CreateVendaDto) {
    return this.prisma.$transaction(async (tx) => {
      const pdv = await tx.pDV.findUnique({ where: { id: dto.pdvId } });
      if (!pdv) throw new NotFoundException('PDV não encontrado');
      if (pdv.status !== PdvStatus.LIVRE && pdv.status !== PdvStatus.OCUPADO) {
        throw new BadRequestException(`PDV no status ${pdv.status} não pode efetuar vendas`);
      }

      const existing = await tx.venda.findUnique({
        where: { pdvId_numero: { pdvId: dto.pdvId, numero: dto.numero } },
      });
      if (existing) {
        throw new BadRequestException(`Já existe uma venda com o número ${dto.numero} neste PDV`);
      }

      const venda = await tx.venda.create({
        data: {
          companyId: dto.companyId,
          unidadeId: dto.unidadeId,
          pdvId: dto.pdvId,
          numero: dto.numero,
          clienteId: dto.clienteId,
          itens: JSON.parse(JSON.stringify(dto.itens)),
          pagamentos: JSON.parse(JSON.stringify(dto.pagamentos)),
          subtotal: dto.subtotal,
          desconto: dto.desconto || 0,
          acrescimo: dto.acrescimo || 0,
          total: dto.total,
          troco: dto.troco,
          tipo: (dto.tipo as any) || 'PDV',
          status: VendaStatus.EM_ANDAMENTO,
          operadorId: dto.operadorId,
        },
      });

      await tx.pDV.update({
        where: { id: dto.pdvId },
        data: { status: PdvStatus.OCUPADO },
      });

      if (dto.itens && dto.itens.length > 0) {
        await tx.itemVenda.createMany({
          data: dto.itens.map((item) => ({
            vendaId: venda.id,
            produtoId: item.produtoId,
            codigoBarras: item.codigoBarras,
            descricao: item.descricao,
            quantidade: item.quantidade,
            unidade: (item.unidade as any) || 'UN',
            precoUnitario: item.precoUnitario,
            precoTotal: item.precoTotal,
            desconto: item.desconto || 0,
            peso: item.peso,
            lote: item.lote,
            validade: item.validade,
            setor: item.setor,
          })),
        });
      }

      if (dto.pagamentos && dto.pagamentos.length > 0) {
        await tx.pagamentoVenda.createMany({
          data: dto.pagamentos.map((pag) => ({
            vendaId: venda.id,
            tipo: pag.tipo as any,
            valor: pag.valor,
            parcelas: pag.parcelas || 1,
            bandeira: pag.bandeira,
            codigoAutorizacao: pag.codigoAutorizacao,
            nsu: pag.nsu,
            pixCopiaCola: pag.pixCopiaCola,
            chavePix: pag.chavePix,
            idTransacao: pag.idTransacao,
            trocoPara: pag.trocoPara,
            troco: pag.troco,
          })),
        });
      }

      this.logger.log(`Venda ${venda.numero} criada no PDV ${pdv.codigo}`);
      return { success: true, data: venda };
    });
  }

  async findAll(query: VendaQueryDto) {
    const where: any = {};
    if (query.companyId) where.companyId = query.companyId;
    if (query.unidadeId) where.unidadeId = query.unidadeId;
    if (query.pdvId) where.pdvId = query.pdvId;
    if (query.status) where.status = query.status;
    if (query.clienteId) where.clienteId = query.clienteId;
    if (query.dataInicio || query.dataFim) {
      where.dataHora = {};
      if (query.dataInicio) where.dataHora.gte = query.dataInicio;
      if (query.dataFim) where.dataHora.lte = query.dataFim;
    }

    const vendas = await this.prisma.venda.findMany({
      where,
      include: { itensVenda: true, pagamentosVenda: true },
      orderBy: { dataHora: 'desc' },
    });
    return { success: true, data: vendas };
  }

  async findOne(id: string) {
    const venda = await this.prisma.venda.findUnique({
      where: { id },
      include: { itensVenda: true, pagamentosVenda: true, pdv: true },
    });
    if (!venda) throw new NotFoundException('Venda não encontrada');
    return { success: true, data: venda };
  }

  async finalizar(id: string, dto: FinalizarVendaDto) {
    return this.prisma.$transaction(async (tx) => {
      const venda = await tx.venda.findUnique({ where: { id } });
      if (!venda) throw new NotFoundException('Venda não encontrada');
      if (venda.status !== VendaStatus.EM_ANDAMENTO) {
        throw new BadRequestException(`Venda não pode ser finalizada no status ${venda.status}`);
      }

      let nfceChave: string | undefined;
      let nfceProtocolo: string | undefined;
      let nfceXml: string | undefined;

      if (dto.gerarNfce !== false) {
        try {
          const nfceResult = await this.nfceService.emitirNfce({
            chaveAcesso: '',
            numero: venda.numero,
            serie: 1,
            dataEmissao: new Date(),
            cnpjEmitente: process.env.CNPJ_EMITENTE || '00000000000000',
            nomeEmitente: process.env.NOME_EMITENTE || 'Supermercado Ltda',
            cpfConsumidor: venda.clienteId || undefined,
            itens: (venda.itens as any[]) || [],
            pagamentos: (venda.pagamentos as any[]) || [],
            subtotal: Number(venda.subtotal),
            desconto: Number(venda.desconto),
            total: Number(venda.total),
          });
          nfceChave = nfceResult.chaveAcesso;
          nfceProtocolo = nfceResult.protocolo;
          nfceXml = nfceResult.xmlNfce;
          this.logger.log(`NFC-e emitida: chave=${nfceChave}`);
        } catch (error: any) {
          this.logger.error(`Erro ao emitir NFC-e: ${error.message}`);
        }
      }

      let pontosGerados = 0;
      if (venda.clienteId) {
        try {
          const result = await this.crmClient.creditarPontos(
            venda.clienteId,
            venda.id,
            Number(venda.total),
          );
          pontosGerados = result.pontos || 0;
        } catch (error: any) {
          this.logger.error(`Erro ao creditar pontos: ${error.message}`);
        }
      }

      const updated = await tx.venda.update({
        where: { id },
        data: {
          status: VendaStatus.FINALIZADA,
          nfce: dto.nfce,
          sat: dto.sat,
          nfceChave,
          nfceProtocolo,
          nfceXml,
          pontosGerados,
        },
      });

      await tx.pDV.update({
        where: { id: venda.pdvId },
        data: { status: PdvStatus.LIVRE },
      });

      this.logger.log(`Venda ${venda.numero} finalizada`);
      return { success: true, data: updated };
    });
  }

  async cancelar(id: string, dto: CancelarVendaDto) {
    return this.prisma.$transaction(async (tx) => {
      const venda = await tx.venda.findUnique({
        where: { id },
        include: { itensVenda: true },
      });
      if (!venda) throw new NotFoundException('Venda não encontrada');
      if (venda.status === VendaStatus.CANCELADA) {
        throw new BadRequestException('Venda já está cancelada');
      }

      let nfceCancelada = false;
      if (venda.nfceChave) {
        try {
          nfceCancelada = await this.nfceService.cancelarNfce(
            venda.nfceChave,
            dto.motivoCancelamento,
          );
        } catch (error: any) {
          this.logger.error(`Erro ao cancelar NFC-e: ${error.message}`);
        }
      }

      for (const item of venda.itensVenda) {
        try {
          await this.inventoryClient.darEntrada(
            item.produtoId,
            Number(item.quantidade),
            dto.motivoCancelamento,
            venda.id,
          );
        } catch (error: any) {
          this.logger.error(`Erro ao retornar estoque do item ${item.produtoId}: ${error.message}`);
        }
      }

      if (venda.pontosGerados > 0 && venda.clienteId) {
        try {
          await this.crmClient.debitarPontos(
            venda.clienteId,
            venda.id,
            venda.pontosGerados,
          );
        } catch (error: any) {
          this.logger.error(`Erro ao debitar pontos: ${error.message}`);
        }
      }

      const updated = await tx.venda.update({
        where: { id },
        data: {
          status: VendaStatus.CANCELADA,
          cancelada: true,
          motivoCancelamento: dto.motivoCancelamento,
        },
      });

      await tx.pDV.update({
        where: { id: venda.pdvId },
        data: { status: PdvStatus.LIVRE },
      });

      this.logger.log(`Venda ${venda.numero} cancelada: ${dto.motivoCancelamento}`);
      return { success: true, data: updated };
    });
  }

  async suspender(id: string) {
    const venda = await this.prisma.venda.findUnique({ where: { id } });
    if (!venda) throw new NotFoundException('Venda não encontrada');
    if (venda.status !== VendaStatus.EM_ANDAMENTO) {
      throw new BadRequestException('Apenas vendas em andamento podem ser suspensas');
    }

    const updated = await this.prisma.venda.update({
      where: { id },
      data: {
        status: VendaStatus.SUSPENSA,
        suspensaEm: new Date(),
      },
    });

    await this.prisma.pDV.update({
      where: { id: venda.pdvId },
      data: { status: PdvStatus.LIVRE },
    });

    this.logger.log(`Venda ${venda.numero} suspensa`);
    return { success: true, data: updated };
  }

  async listarSuspensas(query: VendaQueryDto) {
    const where: any = { status: VendaStatus.SUSPENSA };
    if (query.companyId) where.companyId = query.companyId;
    if (query.unidadeId) where.unidadeId = query.unidadeId;
    if (query.pdvId) where.pdvId = query.pdvId;

    const vendas = await this.prisma.venda.findMany({
      where,
      include: { itensVenda: true, pagamentosVenda: true, pdv: true },
      orderBy: { suspensaEm: 'desc' },
    });
    return { success: true, data: vendas };
  }

  async reativar(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const venda = await tx.venda.findUnique({ where: { id } });
      if (!venda) throw new NotFoundException('Venda não encontrada');
      if (venda.status !== VendaStatus.SUSPENSA) {
        throw new BadRequestException('Venda não está suspensa');
      }

      const updated = await tx.venda.update({
        where: { id },
        data: {
          status: VendaStatus.EM_ANDAMENTO,
          suspensaEm: null,
        },
      });

      await tx.pDV.update({
        where: { id: venda.pdvId },
        data: { status: PdvStatus.OCUPADO },
      });

      this.logger.log(`Venda ${venda.numero} reativada`);
      return { success: true, data: updated };
    });
  }

  async remove(id: string) {
    const venda = await this.prisma.venda.findUnique({ where: { id } });
    if (!venda) throw new NotFoundException('Venda não encontrada');

    await this.prisma.itemVenda.deleteMany({ where: { vendaId: id } });
    await this.prisma.pagamentoVenda.deleteMany({ where: { vendaId: id } });
    await this.prisma.venda.delete({ where: { id } });
    return { success: true, message: 'Venda removida com sucesso' };
  }
}
