import { Injectable, Logger } from '@nestjs/common';
import { CalcularIcmsDto, CalcularPisCofinsDto, CalcularTotalTributosDto } from './dto/tributos.dto';

@Injectable()
export class TributosService {
  private readonly logger = new Logger(TributosService.name);

  private readonly tabelaICMS: Record<string, { interna: number; interestadual: Record<string, number> }> = {
    AC: { interna: 17, interestadual: { default: 12 } },
    AL: { interna: 17, interestadual: { default: 12 } },
    AM: { interna: 18, interestadual: { default: 12 } },
    AP: { interna: 18, interestadual: { default: 12 } },
    BA: { interna: 18, interestadual: { default: 12 } },
    CE: { interna: 18, interestadual: { default: 12 } },
    DF: { interna: 18, interestadual: { default: 12 } },
    ES: { interna: 17, interestadual: { default: 12 } },
    GO: { interna: 17, interestadual: { default: 12 } },
    MA: { interna: 18, interestadual: { default: 12 } },
    MT: { interna: 17, interestadual: { default: 12 } },
    MS: { interna: 17, interestadual: { default: 12 } },
    MG: { interna: 18, interestadual: { default: 12, SP: 12, RJ: 12 } },
    PA: { interna: 17, interestadual: { default: 12 } },
    PB: { interna: 18, interestadual: { default: 12 } },
    PR: { interna: 18, interestadual: { default: 12 } },
    PE: { interna: 18, interestadual: { default: 12 } },
    PI: { interna: 18, interestadual: { default: 12 } },
    RJ: { interna: 18, interestadual: { default: 12, SP: 12 } },
    RN: { interna: 18, interestadual: { default: 12 } },
    RS: { interna: 17, interestadual: { default: 12 } },
    RO: { interna: 17, interestadual: { default: 12 } },
    RR: { interna: 17, interestadual: { default: 12 } },
    SC: { interna: 17, interestadual: { default: 12 } },
    SP: { interna: 18, interestadual: { default: 12, RJ: 12, MG: 12 } },
    SE: { interna: 18, interestadual: { default: 12 } },
    TO: { interna: 18, interestadual: { default: 12 } },
  };

  private readonly beneficiosFiscais: Record<string, any[]> = {
    SP: [
      { nome: 'DIFERIMENTO', descricao: 'Diferimento do ICMS em operações com produtos agropecuários', reducaoBase: 0, isencao: false },
      { nome: 'REDUCAO_BASE', descricao: 'Redução de base de cálculo em operações interestaduais', reducaoBase: 7.14, isencao: false },
    ],
    MG: [
      { nome: 'REDUCAO_BASE', descricao: 'Redução de 50% na base de cálculo do ICMS em operações internas', reducaoBase: 50, isencao: false },
    ],
    RJ: [
      { nome: 'ISENCAO', descricao: 'Isenção de ICMS para produtos da cesta básica', reducaoBase: 100, isencao: true },
    ],
    RS: [
      { nome: 'REDUCAO_BASE', descricao: 'Redução de 40% na base de cálculo para produtos alimentícios', reducaoBase: 40, isencao: false },
    ],
    PR: [
      { nome: 'DIFERIMENTO', descricao: 'Diferimento parcial para produtos industrializados', reducaoBase: 30, isencao: false },
    ],
    default: [
      { nome: 'SEM_BENEFICIO', descricao: 'Sem benefício fiscal cadastrado', reducaoBase: 0, isencao: false },
    ],
  };

  private getAliquotaIcms(ufOrigem: string, ufDestino: string): number {
    const uf = this.tabelaICMS[ufOrigem.toUpperCase()];
    if (!uf) return 18;
    if (ufOrigem.toUpperCase() === ufDestino.toUpperCase()) return uf.interna;
    return uf.interestadual[ufDestino.toUpperCase()] || uf.interestadual.default || 12;
  }

  calcularIcms(dto: CalcularIcmsDto) {
    const baseCalculo = dto.valorProdutos + dto.valorFrete + dto.valorSeguro + dto.valorDespesas;
    const aliquota = dto.aliquotaPersonalizada || this.getAliquotaIcms(dto.ufOrigem, dto.ufDestino);
    const reducao = dto.reducaoBase || 0;
    const baseReduzida = baseCalculo * (1 - reducao / 100);
    const valorIcms = baseReduzida * (aliquota / 100);

    const cst = dto.cstIcms;
    const isento = ['40', '41', '60'].includes(cst);
    const suspenso = ['10', '30', '70'].includes(cst);

    const resultado = {
      baseCalculo: Math.round(baseCalculo * 100) / 100,
      aliquota,
      reducaoBase: reducao,
      baseReduzida: Math.round(baseReduzida * 100) / 100,
      valorIcms: isento ? 0 : Math.round(valorIcms * 100) / 100,
      cst,
      csosn: dto.csosn || null,
      isento,
      suspenso,
      observacao: isento ? 'ICMS isento conforme CST' : suspenso ? 'ICMS suspenso/diferido' : 'ICMS calculado normalmente',
    };

    return { success: true, data: resultado };
  }

  calcularPisCofins(dto: CalcularPisCofinsDto) {
    const regime = dto.regime || 'cumulativo';

    const aliquotaPis = dto.aliquotaPis || (regime === 'cumulativo' ? 0.65 : 1.65);
    const aliquotaCofins = dto.aliquotaCofins || (regime === 'cumulativo' ? 3.0 : 7.6);

    const valorPis = dto.valorTotal * (aliquotaPis / 100);
    const valorCofins = dto.valorTotal * (aliquotaCofins / 100);

    return {
      success: true,
      data: {
        regime,
        baseCalculo: dto.valorTotal,
        aliquotaPis,
        aliquotaCofins,
        valorPis: Math.round(valorPis * 100) / 100,
        valorCofins: Math.round(valorCofins * 100) / 100,
        valorTotal: Math.round((valorPis + valorCofins) * 100) / 100,
      },
    };
  }

  calcularTotal(dto: CalcularTotalTributosDto) {
    const baseCalculo = dto.valorProdutos + dto.valorFrete + dto.valorSeguro + dto.valorDespesas - dto.valorDesconto;
    const aliquotaIcms = this.getAliquotaIcms(dto.ufOrigem, dto.ufDestino);
    const valorIcms = baseCalculo * (aliquotaIcms / 100);

    const regimePis = dto.regimePis || 'cumulativo';
    const aliqPis = regimePis === 'cumulativo' ? 0.65 : 1.65;
    const aliqCofins = regimePis === 'cumulativo' ? 3.0 : 7.6;
    const valorPis = dto.valorProdutos * (aliqPis / 100);
    const valorCofins = dto.valorProdutos * (aliqCofins / 100);

    const valorIpi = this.calcularIpi(dto.ncm, dto.valorProdutos);

    return {
      success: true,
      data: {
        baseCalculo: Math.round(baseCalculo * 100) / 100,
        icms: { aliquota: aliquotaIcms, valor: Math.round(valorIcms * 100) / 100 },
        pis: { regime: regimePis, aliquota: aliqPis, valor: Math.round(valorPis * 100) / 100 },
        cofins: { regime: regimePis, aliquota: aliqCofins, valor: Math.round(valorCofins * 100) / 100 },
        ipi: { valor: Math.round(valorIpi * 100) / 100 },
        totalTributos: Math.round((valorIcms + valorPis + valorCofins + valorIpi) * 100) / 100,
        cfop: dto.cfop,
        ncm: dto.ncm,
      },
    };
  }

  private calcularIpi(ncm: string, valor: number): number {
    const aliquota = this.getAliquotaIpi(ncm);
    return valor * (aliquota / 100);
  }

  private getAliquotaIpi(ncm: string): number {
    const prefixos: Record<string, number> = {
      '22': 10, '24': 5, '27': 7, '28': 8, '29': 10,
      '30': 12, '31': 8, '32': 10, '33': 10, '34': 8,
      '38': 5, '39': 5, '40': 5, '44': 5, '48': 5,
      '61': 5, '62': 5, '63': 5, '64': 5, '65': 5,
      '68': 5, '69': 5, '70': 5, '71': 5, '72': 5,
      '73': 5, '74': 5, '75': 5, '76': 5, '78': 5,
      '79': 5, '80': 5, '81': 5, '82': 5, '83': 5,
      '84': 5, '85': 5, '86': 5, '87': 5, '88': 5,
      '89': 5, '90': 5, '91': 5, '92': 5, '93': 5,
      '94': 5, '95': 5, '96': 5, '97': 5,
    };
    const prefixo = ncm.substring(0, 2);
    return prefixos[prefixo] || 0;
  }

  tabelaIcms() {
    const data = Object.entries(this.tabelaICMS).map(([uf, info]) => ({
      uf,
      aliquotaInterna: `${info.interna}%`,
      aliquotaInterestadual: `${info.interestadual.default}%`,
      descricao: this.getDescricaoUF(uf),
    }));
    return { success: true, data };
  }

  beneficios() {
    const data = Object.entries(this.beneficiosFiscais).map(([uf, beneficios]) => ({
      uf,
      descricaoUF: this.getDescricaoUF(uf),
      beneficios: beneficios.map(b => ({
        tipo: b.nome,
        descricao: b.descricao,
        reducaoBase: `${b.reducaoBase}%`,
        isencao: b.isencao,
      })),
    }));
    return { success: true, data };
  }

  private getDescricaoUF(uf: string): string {
    const mapa: Record<string, string> = {
      AC: 'Acre', AL: 'Alagoas', AM: 'Amazonas', AP: 'Amapá', BA: 'Bahia',
      CE: 'Ceará', DF: 'Distrito Federal', ES: 'Espírito Santo', GO: 'Goiás',
      MA: 'Maranhão', MG: 'Minas Gerais', MS: 'Mato Grosso do Sul', MT: 'Mato Grosso',
      PA: 'Pará', PB: 'Paraíba', PE: 'Pernambuco', PI: 'Piauí', PR: 'Paraná',
      RJ: 'Rio de Janeiro', RN: 'Rio Grande do Norte', RO: 'Rondônia', RR: 'Roraima',
      RS: 'Rio Grande do Sul', SC: 'Santa Catarina', SE: 'Sergipe', SP: 'São Paulo',
      TO: 'Tocantins',
    };
    return mapa[uf] || uf;
  }
}
