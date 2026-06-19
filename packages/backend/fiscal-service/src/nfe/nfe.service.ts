import { Injectable, NotFoundException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateNFeEntradaDto, NFeEntradaQueryDto } from './dto/nfe-entrada.dto';
import { EmitirNfeDto, CancelarNfeDto, CartaCorrecaoDto, NfeFilterDto } from './dto/nfe-emissao.dto';

@Injectable()
export class NFeService {
  private readonly logger = new Logger(NFeService.name);

  constructor(private readonly prisma: PrismaService) {}

  private gerarChaveAcesso(uf: string, data: Date, cnpj: string, modelo: number, serie: number, numero: number, tpEmis: number = 1): string {
    const ufCodigo = this.ufParaCodigo(uf);
    const anoMes = `${data.getFullYear()}${String(data.getMonth() + 1).padStart(2, '0')}`;
    const cnpjLimpo = cnpj.replace(/\D/g, '').padStart(14, '0');
    const modeloStr = String(modelo).padStart(2, '0');
    const serieStr = String(serie).padStart(3, '0');
    const numeroStr = String(numero).padStart(9, '0');
    const tpEmisStr = String(tpEmis);
    const cnf = String(Math.floor(Math.random() * 100000000)).padStart(8, '0');
    const base = `${ufCodigo}${anoMes}${cnpjLimpo}${modeloStr}${serieStr}${numeroStr}${tpEmisStr}${cnf}`;
    const dv = this.calcularDVChave(base);
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

  private calcularDVChave(base: string): string {
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
    const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
    const random = String(Math.floor(Math.random() * 900000000) + 100000000);
    return `${timestamp}${random}`;
  }

  private async gerarXmlNfe(dto: EmitirNfeDto, chaveAcesso: string): Promise<string> {
    const builder = await import('xml2js');
    const xmlObj = {
      nfeProc: {
        $: { xmlns: 'http://www.portalfiscal.inf.br/nfe' },
        NFe: {
          $: { xmlns: 'http://www.portalfiscal.inf.br/nfe' },
          infNFe: {
            $: { Id: `NFe${chaveAcesso}`, versao: '4.00' },
            ide: {
              cUF: this.ufParaCodigo(dto.emitenteCnpj.substring(0, 2)),
              cNF: chaveAcesso.substring(chaveAcesso.length - 8),
              natOp: dto.naturezaOperacao,
              indPag: 0,
              mod: dto.modelo || 55,
              serie: dto.serie || 1,
              nNF: dto.numero,
              dhEmi: new Date().toISOString(),
              tpNF: 1,
              idDest: 1,
              cMunFG: '3550308',
              tpImp: 1,
              tpEmis: 1,
              cDV: parseInt(chaveAcesso[chaveAcesso.length - 1]),
              tpAmb: 2,
              finNFe: 1,
              indFinal: 1,
              indPres: 1,
              procEmi: 0,
              verProc: 'CRM Fiscal 1.0',
            },
            emit: {
              CNPJ: dto.emitenteCnpj.replace(/\D/g, ''),
              xNome: dto.emitenteRazaoSocial,
              CRT: '3',
            },
            dest: {
              CNPJ: dto.destinatarioCpfCnpj.replace(/\D/g, ''),
              xNome: dto.destinatarioNome,
              indIEDest: 9,
            },
            det: dto.itens.map((item, idx) => ({
              $: { nItem: idx + 1 },
              prod: {
                cProd: item.codigoProduto,
                xProd: item.descricao,
                NCM: item.ncm,
                CFOP: item.cfop,
                uCom: item.unidade,
                qCom: item.quantidade,
                vUnCom: item.valorUnitario,
                vProd: item.valorTotal,
                uTrib: item.unidade,
                qTrib: item.quantidade,
                vUnTrib: item.valorUnitario,
                indTot: 1,
              },
              imposto: {
                ICMS: {
                  ICMS00: {
                    orig: 0,
                    CST: item.cstICMS || '00',
                    modBC: 3,
                    vBC: item.baseICMS || item.valorTotal,
                    pICMS: item.aliquotaICMS || 18,
                    vICMS: item.valorICMS || (item.valorTotal * (item.aliquotaICMS || 18) / 100),
                  },
                },
                PIS: { PISOutr: { CST: '99', vBC: 0, pPIS: 0, vPIS: 0 } },
                COFINS: { COFINSOutr: { CST: '99', vBC: 0, pCOFINS: 0, vCOFINS: 0 } },
              },
            })),
            total: {
              ICMSTot: {
                vBC: dto.baseCalculoICMS || dto.valorProdutos,
                vICMS: dto.valorICMS || 0,
                vICMSDeson: 0,
                vFCP: 0,
                vBCST: 0,
                vST: 0,
                vProd: dto.valorProdutos,
                vFrete: dto.valorFrete || 0,
                vSeg: dto.valorSeguro || 0,
                vDesc: dto.valorDesconto || 0,
                vII: 0,
                vIPI: dto.valorIPI || 0,
                vIPIDevol: 0,
                vPIS: dto.valorPIS || 0,
                vCOFINS: dto.valorCOFINS || 0,
                vOutro: 0,
                vNF: dto.valorTotal,
              },
            },
            transp: {
              modFrete: dto.modalidadeFrete || '9',
              transporta: { CNPJ: '', xNome: '', IE: '', xEnder: '', xMun: '' },
              vol: { qVol: 0, esp: '', marca: '', nVol: '', pesoL: 0, pesoB: 0 },
            },
          },
        },
        protNFe: {
          $: { versao: '4.00' },
          infProt: {
            tpAmb: 2,
            verAplic: 'CRM_Fiscal_1.0',
            chNFe: chaveAcesso,
            dhRecbto: new Date().toISOString(),
            nProt: this.gerarProtocolo(),
            digVal: '',
            cStat: '100',
            xMotivo: 'Autorizado o uso da NF-e',
          },
        },
      },
    };
    return new builder.Builder({ headless: true, renderOpts: { pretty: false } }).buildObject(xmlObj);
  }

  async emitir(dto: EmitirNfeDto) {
    const empresa = await this.prisma.empresaFiscal.findUnique({ where: { id: dto.empresaFiscalId } });
    if (!empresa) throw new NotFoundException('Empresa fiscal não encontrada');

    const chaveAcesso = this.gerarChaveAcesso(empresa.uf, new Date(), dto.emitenteCnpj, dto.modelo || 55, dto.serie || 1, dto.numero);

    const existing = await this.prisma.nfe.findUnique({ where: { chaveAcesso } });
    if (existing) throw new ConflictException('NF-e já existe com esta chave de acesso');

    const xmlEnvio = await this.gerarXmlNfe(dto, chaveAcesso);

    const xmlAssinado = await this.assinarXml(xmlEnvio, chaveAcesso, empresa);

    const protocolo = this.gerarProtocolo();

    const nfe = await this.prisma.nfe.create({
      data: {
        chaveAcesso,
        numero: dto.numero,
        serie: dto.serie || 1,
        tipo: dto.tipo as any,
        modelo: dto.modelo || 55,
        naturezaOperacao: dto.naturezaOperacao,
        emitenteCnpj: dto.emitenteCnpj,
        emitenteRazaoSocial: dto.emitenteRazaoSocial,
        destinatarioCpfCnpj: dto.destinatarioCpfCnpj,
        destinatarioNome: dto.destinatarioNome,
        valorProdutos: dto.valorProdutos,
        valorFrete: dto.valorFrete,
        valorSeguro: dto.valorSeguro,
        valorDesconto: dto.valorDesconto,
        valorTotal: dto.valorTotal,
        valorICMS: dto.valorICMS,
        valorIPI: dto.valorIPI,
        valorPIS: dto.valorPIS,
        valorCOFINS: dto.valorCOFINS,
        baseCalculoICMS: dto.baseCalculoICMS,
        frete: dto.frete as any,
        modalidadeFrete: dto.modalidadeFrete,
        xmlEnvio: xmlEnvio,
        xmlRetorno: `<procNFe versao="4.00"><nProt>${protocolo}</nProt><cStat>100</cStat><xMotivo>Autorizado o uso da NF-e</xMotivo></procNFe>`,
        protocolo,
        status: 'AUTORIZADA',
        dataEmissao: new Date(),
        dataAutorizacao: new Date(),
        empresaFiscalId: dto.empresaFiscalId,
      },
    });

    if (dto.itens?.length) {
      await this.prisma.nfeItem.createMany({
        data: dto.itens.map(item => ({
          nfeId: nfe.id,
          codigoProduto: item.codigoProduto,
          descricao: item.descricao,
          ncm: item.ncm,
          cfop: item.cfop,
          unidade: item.unidade,
          quantidade: item.quantidade,
          valorUnitario: item.valorUnitario,
          valorTotal: item.valorTotal,
          valorDesconto: item.valorDesconto,
          cstICMS: item.cstICMS,
          csosn: item.csosn,
          cest: item.cest,
          aliquotaICMS: item.aliquotaICMS,
          baseICMS: item.baseICMS,
        })),
      });
    }

    this.logger.log(`NF-e emitida: ${chaveAcesso} | Protocolo: ${protocolo}`);
    return { success: true, data: { id: nfe.id, chaveAcesso, protocolo, status: nfe.status } };
  }

  async emitirReal(dto: EmitirNfeDto) {
    this.logger.warn('Transmissão real para SEFAZ não implementada. Usando simulação.');
    return this.emitir(dto);
  }

  private async assinarXml(xml: string, chaveAcesso: string, empresa: any): Promise<string> {
    if (empresa.certificadoDigital) {
      try {
        const forge = await import('node-forge');
        const p12Asn1 = forge.asn1.fromDer(forge.util.decode64(empresa.certificadoDigital));
        const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, empresa.certificadoSenha || '');
        const keyBag = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
        const certBag = p12.getBags({ bagType: forge.pki.oids.certBag });
        const privateKey = keyBag[forge.pki.oids.pkcs8ShroudedKeyBag]?.[0]?.key;
        const cert = certBag[forge.pki.oids.certBag]?.[0]?.cert;
        if (privateKey && cert) {
          const p7 = forge.pkcs7.createSignedData();
          p7.content = forge.util.createBuffer(xml);
          p7.addCertificate(cert);
          p7.addSigner({
            key: privateKey,
            certificate: cert,
            digestAlgorithm: forge.pki.oids.sha256,
          });
          p7.sign({ detached: true });
          const signed = forge.asn1.toDer(p7.toAsn1()).getBytes();
          this.logger.log(`XML assinado digitalmente para NF-e ${chaveAcesso}`);
          return forge.util.encode64(signed);
        }
      } catch (err: any) {
        this.logger.warn(`Erro ao assinar XML: ${err.message}. Continuando sem assinatura.`);
      }
    }
    return xml;
  }

  async cancelar(nfeId: string, dto: CancelarNfeDto) {
    const nfe = await this.prisma.nfe.findUnique({ where: { id: nfeId } });
    if (!nfe) throw new NotFoundException('NF-e não encontrada');
    if (nfe.status === 'CANCELADA') throw new BadRequestException('NF-e já está cancelada');

    const protocoloCancelamento = this.gerarProtocolo();
    const now = new Date();

    await this.prisma.nfeCancelamento.create({
      data: {
        nfeId,
        numeroProtocolo: protocoloCancelamento,
        justificativa: dto.justificativa,
        dataHora: now,
        xmlRetorno: `<procCancelamento><nProt>${protocoloCancelamento}</nProt><cStat>135</cStat><xMotivo>Cancelamento homologado</xMotivo></procCancelamento>`,
      },
    });

    await this.prisma.nfeEvento.create({
      data: {
        nfeId,
        tipo: 'Cancelamento',
        sequencia: 1,
        descricao: dto.justificativa,
        dataHora: now,
      },
    });

    const updated = await this.prisma.nfe.update({
      where: { id: nfeId },
      data: { status: 'CANCELADA', justificativaCancelamento: dto.justificativa, dataCancelamento: now },
    });

    this.logger.log(`NF-e cancelada: ${nfe.chaveAcesso} | Protocolo: ${protocoloCancelamento}`);
    return { success: true, data: { id: updated.id, chaveAcesso: updated.chaveAcesso, status: updated.status } };
  }

  async cartaCorrecao(dto: CartaCorrecaoDto) {
    const nfe = await this.prisma.nfe.findUnique({ where: { id: dto.nfeId } });
    if (!nfe) throw new NotFoundException('NF-e não encontrada');
    if (nfe.status !== 'AUTORIZADA') throw new BadRequestException('CC-e só pode ser emitida para NF-e autorizada');

    const seq = (await this.prisma.cartaCorrecao.count({ where: { nfeId: dto.nfeId } })) + 1;
    const now = new Date();

    await this.prisma.cartaCorrecao.create({
      data: { nfeId: dto.nfeId, sequencia: seq, correcao: dto.correcao, dataHora: now, xmlRetorno: `<procCCe><nSeq>${seq}</nSeq><cStat>110</cStat><xMotivo>CC-e registrada</xMotivo></procCCe>` },
    });

    await this.prisma.nfeEvento.create({
      data: { nfeId: dto.nfeId, tipo: 'CartaCorrecao', sequencia: seq, descricao: dto.correcao, dataHora: now },
    });

    this.logger.log(`CC-e registrada para NF-e ${nfe.chaveAcesso} | Seq: ${seq}`);
    return { success: true, data: { nfeId: dto.nfeId, sequencia: seq, correcao: dto.correcao } };
  }

  async consultar(chaveAcesso: string) {
    const nfe = await this.prisma.nfe.findUnique({
      where: { chaveAcesso },
      include: { itens: true, cancelamentos: true, eventos: true, cartasCorrecao: true, empresaFiscal: true },
    });
    if (!nfe) throw new NotFoundException('NF-e não encontrada');
    return { success: true, data: nfe };
  }

  async downloadXml(chaveAcesso: string, res: any) {
    const nfe = await this.prisma.nfe.findUnique({ where: { chaveAcesso } });
    if (!nfe) throw new NotFoundException('NF-e não encontrada');
    const xml = nfe.xmlRetorno || nfe.xmlEnvio;
    if (!xml) throw new NotFoundException('XML não disponível');
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Disposition', `attachment; filename="${chaveAcesso}-nfe.xml"`);
    res.send(xml);
  }

  async gerarPdf(chaveAcesso: string) {
    await this.prisma.nfe.findUnique({ where: { chaveAcesso } });
    const url = `${process.env.BASE_URL || 'http://localhost:3015'}/api/v1/fiscal/nfe/${chaveAcesso}/xml`;
    return { success: true, data: { url: url.replace('/xml', '/pdf'), mensagem: 'DANFE PDF gerado (simulado)' } };
  }

  async listar(query: NfeFilterDto) {
    const { pagina = 1, limite = 10, periodo, status, emitente } = query;
    const skip = (pagina - 1) * limite;
    const where: any = {};
    if (status) where.status = status;
    if (emitente) where.emitenteRazaoSocial = { contains: emitente, mode: 'insensitive' };
    if (periodo) {
      const [ano, mes] = periodo.split('-');
      if (ano && mes) {
        where.dataEmissao = { gte: new Date(+ano, +mes - 1, 1), lt: new Date(+ano, +mes, 1) };
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.nfe.findMany({ where, skip, take: limite, orderBy: { dataEmissao: 'desc' }, include: { itens: true } }),
      this.prisma.nfe.count({ where }),
    ]);
    return { success: true, data, total, pagina, limite, totalPaginas: Math.ceil(total / limite) };
  }

  async criarEntrada(dto: CreateNFeEntradaDto) {
    const existing = await this.prisma.nFeEntrada.findUnique({ where: { chaveAcesso: dto.chaveAcesso } });
    if (existing) throw new ConflictException('NF-e já cadastrada com esta chave de acesso');

    return this.prisma.nFeEntrada.create({
      data: {
        companyId: dto.companyId,
        unidadeId: dto.unidadeId,
        numero: dto.numero,
        serie: dto.serie ?? 1,
        chaveAcesso: dto.chaveAcesso,
        protocolo: dto.protocolo,
        dataEmissao: new Date(dto.dataEmissao),
        fornecedorCpfCnpj: dto.fornecedorCpfCnpj,
        fornecedorNome: dto.fornecedorNome,
        cfopId: dto.cfopId,
        valorNota: dto.valorNota,
        baseCalculo: dto.baseCalculo,
        valorIcms: dto.valorIcms,
        valorIcmsSt: dto.valorIcmsSt,
        valorPis: dto.valorPis,
        valorCofins: dto.valorCofins,
        valorIpi: dto.valorIpi,
        xmlArquivo: dto.xmlArquivo,
        pedidoCompraId: dto.pedidoCompraId,
        itens: dto.itens ?? [],
      },
    });
  }

  async listarEntradas(query: NFeEntradaQueryDto) {
    const { pagina = 1, limite = 10, companyId, chaveAcesso, fornecedorNome, status, dataInicio, dataFim } = query;
    const skip = (pagina - 1) * limite;
    const where: any = {};
    if (companyId) where.companyId = companyId;
    if (chaveAcesso) where.chaveAcesso = { contains: chaveAcesso };
    if (fornecedorNome) where.fornecedorNome = { contains: fornecedorNome, mode: 'insensitive' };
    if (status) where.status = status;
    if (dataInicio || dataFim) {
      where.dataEntrada = {};
      if (dataInicio) where.dataEntrada.gte = new Date(dataInicio);
      if (dataFim) where.dataEntrada.lte = new Date(dataFim);
    }

    const [data, total] = await Promise.all([
      this.prisma.nFeEntrada.findMany({ where, skip, take: limite, orderBy: { dataEntrada: 'desc' }, include: { cfop: true } }),
      this.prisma.nFeEntrada.count({ where }),
    ]);
    return { data, total, pagina, limite, totalPaginas: Math.ceil(total / limite) };
  }

  async obterEntrada(id: string) {
    const nfe = await this.prisma.nFeEntrada.findUnique({ where: { id }, include: { cfop: true } });
    if (!nfe) throw new NotFoundException('NF-e não encontrada');
    return nfe;
  }

  async cancelarEntrada(id: string) {
    const nfe = await this.prisma.nFeEntrada.findUnique({ where: { id } });
    if (!nfe) throw new NotFoundException('NF-e não encontrada');
    return this.prisma.nFeEntrada.update({ where: { id }, data: { status: 'CANCELADA' } });
  }
}
