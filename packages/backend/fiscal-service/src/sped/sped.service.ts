import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { GerarSpedDto, GerarSpedContabilDto, SpedHistoricoDto } from './dto/sped.dto';

@Injectable()
export class SpedService {
  private readonly logger = new Logger(SpedService.name);

  constructor(private readonly prisma: PrismaService) {}

  async gerarSpedFiscal(dto: GerarSpedDto) {
    const existing = await this.prisma.spedFiscal.findUnique({
      where: { companyId_unidadeId_mes_ano_tipo: { companyId: dto.companyId, unidadeId: dto.unidadeId, mes: dto.mes, ano: dto.ano, tipo: 'FISCAL' } },
    });
    if (existing) throw new ConflictException('SPED Fiscal já gerado para este período');

    const nfes = await this.prisma.nFeEntrada.findMany({
      where: {
        companyId: dto.companyId,
        status: 'AUTORIZADA',
        dataEntrada: {
          gte: new Date(dto.ano, dto.mes - 1, 1),
          lt: new Date(dto.ano, dto.mes, 1),
        },
      },
      include: { cfop: true },
    });

    const nfces = await this.prisma.nFceSaida.findMany({
      where: {
        companyId: dto.companyId,
        status: 'AUTORIZADA',
        dataEmissao: {
          gte: new Date(dto.ano, dto.mes - 1, 1),
          lt: new Date(dto.ano, dto.mes, 1),
        },
      },
    });

    const linhas: string[] = [];
    linhas.push(`|REGISTRO|SPED FISCAL v${dto.versao || '018'}|${dto.mes}|${dto.ano}|`);
    linhas.push(`|0000|${dto.companyId}|${dto.unidadeId}|${dto.mes}|${dto.ano}|GERADO PELO SISTEMA|`);
    for (const nfe of nfes) {
      linhas.push(`|C100|${nfe.chaveAcesso}|${nfe.fornecedorCpfCnpj}|${nfe.fornecedorNome}|${nfe.cfop.codigo}|${nfe.valorNota}|${nfe.valorIcms || 0}|`);
    }
    for (const nfce of nfces) {
      linhas.push(`|C500|${nfce.chaveAcesso}|${nfce.valorNota}|${nfce.destinatarioCpfCnpj || 'CONSUMIDOR'}|`);
    }
    const arquivoTxt = linhas.join('\n');

    return this.prisma.spedFiscal.create({
      data: {
        companyId: dto.companyId,
        unidadeId: dto.unidadeId,
        mes: dto.mes,
        ano: dto.ano,
        versao: dto.versao ?? '018',
        tipo: 'FISCAL',
        status: 'GERADO',
        arquivoTxt,
        dataGeracao: new Date(),
      },
    });
  }

  async gerarSpedContabil(dto: GerarSpedContabilDto) {
    const existing = await this.prisma.spedFiscal.findUnique({
      where: { companyId_unidadeId_mes_ano_tipo: { companyId: dto.companyId, unidadeId: dto.unidadeId, mes: dto.mes, ano: dto.ano, tipo: 'CONTABIL' } },
    });
    if (existing) throw new ConflictException('SPED Contábil já gerado para este período');

    const linhas: string[] = [];
    linhas.push(`|REGISTRO|SPED CONTABIL ECF v${dto.versao || '9'}|${dto.mes}|${dto.ano}|`);
    linhas.push(`|0000|${dto.companyId}|${dto.unidadeId}|${dto.mes}|${dto.ano}|ECF GERADO PELO SISTEMA|`);
    linhas.push(`|J001|${dto.companyId}|BALANCETE PERIODICO|`);
    linhas.push(`|J900|SDO|1.00|CONTAS CONTABEIS SIMULADAS|`);
    linhas.push(`|J930|${dto.companyId}|IDENTIFICACAO DA ESCRITURACAO|`);
    const arquivoTxt = linhas.join('\n');

    return this.prisma.spedFiscal.create({
      data: {
        companyId: dto.companyId,
        unidadeId: dto.unidadeId,
        mes: dto.mes,
        ano: dto.ano,
        versao: dto.versao ?? '9',
        tipo: 'CONTABIL',
        status: 'GERADO',
        arquivoTxt,
        dataGeracao: new Date(),
      },
    });
  }

  async gerarSpedPisCofins(dto: GerarSpedDto) {
    const existing = await this.prisma.spedPisCofins.findUnique({
      where: { companyId_unidadeId_mes_ano: { companyId: dto.companyId, unidadeId: dto.unidadeId, mes: dto.mes, ano: dto.ano } },
    });
    if (existing) throw new ConflictException('SPED PIS/COFINS já gerado para este período');

    const nfes = await this.prisma.nFeEntrada.findMany({
      where: {
        companyId: dto.companyId,
        status: 'AUTORIZADA',
        dataEntrada: {
          gte: new Date(dto.ano, dto.mes - 1, 1),
          lt: new Date(dto.ano, dto.mes, 1),
        },
      },
    });

    const linhas: string[] = [];
    linhas.push(`|REGISTRO|SPED PIS/COFINS v${dto.versao || '1.04'}|${dto.mes}|${dto.ano}|`);
    for (const nfe of nfes) {
      linhas.push(`|C010|${nfe.chaveAcesso}|${nfe.valorPis || 0}|${nfe.valorCofins || 0}|`);
    }
    const arquivoTxt = linhas.join('\n');

    return this.prisma.spedPisCofins.create({
      data: {
        companyId: dto.companyId,
        unidadeId: dto.unidadeId,
        mes: dto.mes,
        ano: dto.ano,
        versao: dto.versao ?? '1.04',
        status: 'GERADO',
        arquivoTxt,
        dataGeracao: new Date(),
      },
    });
  }

  async historico(query: SpedHistoricoDto) {
    const { pagina = 1, limite = 10, companyId, tipo } = query;
    const skip = (pagina - 1) * limite;
    const where: any = {};
    if (companyId) where.companyId = companyId;
    if (tipo) where.tipo = tipo;

    const [fiscais, pisCofins] = await Promise.all([
      this.prisma.spedFiscal.findMany({ where, skip, take: limite, orderBy: [{ ano: 'desc' }, { mes: 'desc' }] }),
      this.prisma.spedPisCofins.findMany({
        where: companyId ? { companyId } : {},
        orderBy: [{ ano: 'desc' }, { mes: 'desc' }],
      }),
    ]);

    const historico = [
      ...fiscais.map(s => ({ id: s.id, tipo: s.tipo || 'FISCAL', mes: s.mes, ano: s.ano, status: s.status, dataGeracao: s.dataGeracao, companyId: s.companyId })),
      ...pisCofins.map(s => ({ id: s.id, tipo: 'PIS_COFINS', mes: s.mes, ano: s.ano, status: s.status, dataGeracao: s.dataGeracao, companyId: s.companyId })),
    ].sort((a, b) => {
      if (a.ano !== b.ano) return b.ano - a.ano;
      if (a.mes !== b.mes) return b.mes - a.mes;
      return 0;
    });

    return { success: true, data: historico, total: historico.length, pagina, limite };
  }

  async listarSpedFiscal(companyId: string) {
    return this.prisma.spedFiscal.findMany({ where: { companyId }, orderBy: [{ ano: 'desc' }, { mes: 'desc' }] });
  }

  async listarSpedPisCofins(companyId: string) {
    return this.prisma.spedPisCofins.findMany({ where: { companyId }, orderBy: [{ ano: 'desc' }, { mes: 'desc' }] });
  }

  async obterSpedFiscal(id: string) {
    const sped = await this.prisma.spedFiscal.findUnique({ where: { id } });
    if (!sped) throw new NotFoundException('SPED Fiscal não encontrado');
    return sped;
  }

  async obterSpedPisCofins(id: string) {
    const sped = await this.prisma.spedPisCofins.findUnique({ where: { id } });
    if (!sped) throw new NotFoundException('SPED PIS/COFINS não encontrado');
    return sped;
  }
}
