import { Injectable, NotFoundException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateNFceSaidaDto, NFceSaidaQueryDto } from './dto/nfce-saida.dto';
import { EmitirNfceDto } from './dto/nfce-emissao.dto';

@Injectable()
export class NFceService {
  private readonly logger = new Logger(NFceService.name);

  constructor(private readonly prisma: PrismaService) {}

  private gerarChaveAcessoNfce(empresa: any, numero: number, serie: number): string {
    const ufCodigo = this.ufParaCodigo(empresa.uf);
    const now = new Date();
    const anoMes = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const cnpj = empresa.cnpj.replace(/\D/g, '').padStart(14, '0');
    const modelo = '65';
    const serieStr = String(serie).padStart(3, '0');
    const numeroStr = String(numero).padStart(9, '0');
    const tpEmis = '1';
    const cnf = String(Math.floor(Math.random() * 100000000)).padStart(8, '0');
    const base = `${ufCodigo}${anoMes}${cnpj}${modelo}${serieStr}${numeroStr}${tpEmis}${cnf}`;
    const dv = this.calcularDV(base);
    return `${base}${dv}`;
  }

  private ufParaCodigo(uf: string): string {
    const mapa: Record<string, string> = {
      RO: '11', AC: '12', AM: '13', RR: '14', PA: '15', AP: '16', TO: '17',
      MA: '21', PI: '22', CE: '23', RN: '24', PB: '25', PE: '26', AL: '27',
      SE: '28', BA: '29', MG: '31', ES: '32', RJ: '33', SP: '35', PR: '41',
      SC: '42', RS: '43', MS: '50', MT: '51', GO: '52', DF: '53',
    };
    return mapa[uf.toUpperCase()] || '35';
  }

  private calcularDV(base: string): string {
    const pesos = [2, 3, 4, 5, 6, 7, 8, 9];
    let soma = 0;
    const reversed = base.split('').reverse();
    for (let i = 0; i < reversed.length; i++) {
      soma += parseInt(reversed[i]) * pesos[i % pesos.length];
    }
    const resto = soma % 11;
    if (resto < 2) return '0';
    return String(11 - resto);
  }

  private gerarProtocolo(): string {
    const now = new Date();
    const ts = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
    return `${ts}${String(Math.floor(Math.random() * 900000000) + 100000000)}`;
  }

  async emitir(dto: EmitirNfceDto) {
    const empresa = await this.prisma.empresaFiscal.findUnique({ where: { id: dto.empresaFiscalId } });
    if (!empresa) throw new NotFoundException('Empresa fiscal não encontrada');

    const chaveAcesso = this.gerarChaveAcessoNfce(empresa, dto.numero, dto.serie || 1);

    const existing = await this.prisma.nFceSaida.findUnique({ where: { vendaId: dto.vendaId } });
    if (existing) throw new ConflictException('NFC-e já emitida para esta venda');

    const protocolo = this.gerarProtocolo();

    const nfce = await this.prisma.nFceSaida.create({
      data: {
        companyId: empresa.id,
        unidadeId: empresa.id,
        vendaId: dto.vendaId,
        numero: dto.numero,
        serie: dto.serie ?? 1,
        chaveAcesso,
        protocolo,
        destinatarioCpfCnpj: dto.destinatarioCpfCnpj,
        destinatarioNome: dto.destinatarioNome,
        valorNota: dto.valorNota,
        finalidade: (dto.finalidade as any) ?? 'NORMAL',
        status: 'AUTORIZADA',
        itens: (dto.itens ?? []) as any,
        pagamentos: (dto.pagamentos ?? []) as any,
      },
    });

    this.logger.log(`NFC-e emitida: ${chaveAcesso}`);
    return { success: true, data: { id: nfce.id, chaveAcesso, protocolo, status: nfce.status } };
  }

  async cancelar(nfceId: string) {
    const nfce = await this.prisma.nFceSaida.findUnique({ where: { id: nfceId } });
    if (!nfce) throw new NotFoundException('NFC-e não encontrada');
    if (nfce.status === 'CANCELADA') throw new BadRequestException('NFC-e já está cancelada');

    await this.prisma.nFceSaida.update({ where: { id: nfceId }, data: { status: 'CANCELADA' } });
    this.logger.log(`NFC-e cancelada: ${nfce.chaveAcesso}`);
    return { success: true, data: { id: nfce.id, chaveAcesso: nfce.chaveAcesso, status: 'CANCELADA' } };
  }

  async consultar(chaveAcesso: string) {
    const nfce = await this.prisma.nFceSaida.findFirst({ where: { chaveAcesso } });
    if (!nfce) throw new NotFoundException('NFC-e não encontrada');
    return { success: true, data: nfce };
  }

  async criar(dto: CreateNFceSaidaDto) {
    const existing = await this.prisma.nFceSaida.findUnique({ where: { vendaId: dto.vendaId } });
    if (existing) throw new ConflictException('NFC-e já emitida para esta venda');

    return this.prisma.nFceSaida.create({
      data: {
        companyId: dto.companyId,
        unidadeId: dto.unidadeId,
        vendaId: dto.vendaId,
        numero: dto.numero,
        serie: dto.serie ?? 1,
        chaveAcesso: dto.chaveAcesso,
        protocolo: dto.protocolo,
        destinatarioCpfCnpj: dto.destinatarioCpfCnpj,
        destinatarioNome: dto.destinatarioNome,
        valorNota: dto.valorNota,
        finalidade: (dto.finalidade as any) ?? 'NORMAL',
        itens: dto.itens ?? [],
        pagamentos: dto.pagamentos ?? [],
      },
    });
  }

  async listar(query: NFceSaidaQueryDto) {
    const { pagina = 1, limite = 10, companyId, vendaId, status } = query;
    const skip = (pagina - 1) * limite;
    const where: any = {};
    if (companyId) where.companyId = companyId;
    if (vendaId) where.vendaId = vendaId;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.nFceSaida.findMany({ where, skip, take: limite, orderBy: { dataEmissao: 'desc' } }),
      this.prisma.nFceSaida.count({ where }),
    ]);
    return { data, total, pagina, limite, totalPaginas: Math.ceil(total / limite) };
  }

  async obter(id: string) {
    const nfce = await this.prisma.nFceSaida.findUnique({ where: { id } });
    if (!nfce) throw new NotFoundException('NFC-e não encontrada');
    return nfce;
  }

  async autorizar(id: string, protocolo: string) {
    const nfce = await this.prisma.nFceSaida.findUnique({ where: { id } });
    if (!nfce) throw new NotFoundException('NFC-e não encontrada');
    return this.prisma.nFceSaida.update({ where: { id }, data: { status: 'AUTORIZADA', protocolo } });
  }

  async cancelarPorId(id: string) {
    const nfce = await this.prisma.nFceSaida.findUnique({ where: { id } });
    if (!nfce) throw new NotFoundException('NFC-e não encontrada');
    return this.prisma.nFceSaida.update({ where: { id }, data: { status: 'CANCELADA' } });
  }
}
