import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class ValidacaoService {
  private readonly logger = new Logger(ValidacaoService.name);

  constructor(private readonly prisma: PrismaService) {}

  validarCnpj(cnpj: string) {
    const cleaned = cnpj.replace(/\D/g, '');
    if (cleaned.length !== 14) {
      return { success: false, data: null, errors: ['CNPJ deve ter 14 dígitos'] };
    }

    if (/^(\d)\1{13}$/.test(cleaned)) {
      return { success: false, data: null, errors: ['CNPJ com dígitos repetidos'] };
    }

    const calcDigit = (base: string, pesos: number[]) => {
      let sum = 0;
      for (let i = 0; i < base.length; i++) {
        sum += parseInt(base[i]) * pesos[i];
      }
      const resto = sum % 11;
      return resto < 2 ? 0 : 11 - resto;
    };

    const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    const dig1 = calcDigit(cleaned.slice(0, 12), pesos1);
    const dig2 = calcDigit(cleaned.slice(0, 13), pesos2);

    if (dig1 !== parseInt(cleaned[12]) || dig2 !== parseInt(cleaned[13])) {
      return { success: false, data: null, errors: ['Dígitos verificadores inválidos'] };
    }

    return {
      success: true,
      data: {
        formato: 'XX.XXX.XXX/XXXX-XX',
        mascarado: `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12, 14)}`,
      },
    };
  }

  validarCpf(cpf: string) {
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length !== 11) {
      return { success: false, data: null, errors: ['CPF deve ter 11 dígitos'] };
    }

    if (/^(\d)\1{10}$/.test(cleaned)) {
      return { success: false, data: null, errors: ['CPF com dígitos repetidos'] };
    }

    const calcDigit = (base: string, fatores: number[]) => {
      let sum = 0;
      for (let i = 0; i < base.length; i++) {
        sum += parseInt(base[i]) * fatores[i];
      }
      const resto = sum % 11;
      return resto < 2 ? 0 : 11 - resto;
    };

    const dig1 = calcDigit(cleaned.slice(0, 9), [10, 9, 8, 7, 6, 5, 4, 3, 2]);
    const dig2 = calcDigit(cleaned.slice(0, 10), [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]);

    if (dig1 !== parseInt(cleaned[9]) || dig2 !== parseInt(cleaned[10])) {
      return { success: false, data: null, errors: ['Dígitos verificadores inválidos'] };
    }

    return {
      success: true,
      data: {
        formato: 'XXX.XXX.XXX-XX',
        mascarado: `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`,
      },
    };
  }

  validarInscricaoEstadual(ie: string, uf: string) {
    const cleaned = ie.replace(/\D/g, '');
    const ufUpper = uf.toUpperCase();

    const regras: Record<string, { length: number; pattern: RegExp; format: string }> = {
      AC: { length: 13, pattern: /^\d{13}$/, format: 'XX.XXX.XXX/XXX-XX' },
      AL: { length: 9, pattern: /^\d{9}$/, format: 'XXXXXXXXX' },
      AP: { length: 9, pattern: /^\d{9}$/, format: 'XXXXXXXXX' },
      AM: { length: 9, pattern: /^\d{9}$/, format: 'XX.XXX.XXX-X' },
      BA: { length: 8, pattern: /^\d{8,9}$/, format: 'XXXXXX-XX' },
      CE: { length: 9, pattern: /^\d{9}$/, format: 'XXXXXXXXX' },
      DF: { length: 13, pattern: /^\d{13}$/, format: 'XX.XXX.XXX/XXX-XX' },
      ES: { length: 9, pattern: /^\d{9}$/, format: 'XXXXXXXXX' },
      GO: { length: 9, pattern: /^\d{9}$/, format: 'XX.XXX.XXX-X' },
      MA: { length: 9, pattern: /^\d{9}$/, format: 'XXXXXXXXX' },
      MT: { length: 11, pattern: /^\d{11}$/, format: 'XXX.XXX.XXX-X' },
      MS: { length: 9, pattern: /^\d{9}$/, format: 'XXXXXXXXX' },
      MG: { length: 13, pattern: /^\d{13}$/, format: 'XXX.XXX.XXX/XXXX' },
      PA: { length: 9, pattern: /^\d{9}$/, format: 'XX-XXXXXX-X' },
      PB: { length: 9, pattern: /^\d{9}$/, format: 'XXXXXXXXX' },
      PR: { length: 10, pattern: /^\d{10}$/, format: 'XXX.XXXXX-XX' },
      PE: { length: 9, pattern: /^\d{9}$/, format: 'XX.XXX.XXX-X' },
      PI: { length: 9, pattern: /^\d{9}$/, format: 'XXXXXXXXX' },
      RJ: { length: 8, pattern: /^\d{8}$/, format: 'XX.XXX.XX-X' },
      RN: { length: 9, pattern: /^\d{9}$/, format: 'XX.XXX.XXX-X' },
      RS: { length: 10, pattern: /^\d{10}$/, format: 'XXX/XXXXXXX' },
      RO: { length: 9, pattern: /^\d{9}$/, format: 'XXXXXXXXX' },
      RR: { length: 9, pattern: /^\d{9}$/, format: 'XXXXXXXXX' },
      SC: { length: 9, pattern: /^\d{9}$/, format: 'XXX.XXX.XXX' },
      SP: { length: 12, pattern: /^\d{12}$/, format: 'XXX.XXX.XXX.XXX' },
      SE: { length: 9, pattern: /^\d{9}$/, format: 'XXXXXXXXX' },
      TO: { length: 9, pattern: /^\d{9}$/, format: 'XXXXXXXXX' },
    };

    const regra = regras[ufUpper];
    if (!regra) {
      return { success: false, data: null, errors: [`UF ${uf} não reconhecida`] };
    }

    if (cleaned.length !== regra.length) {
      return {
        success: false,
        data: null,
        errors: [`IE para ${ufUpper} deve ter ${regra.length} dígitos (tem ${cleaned.length})`],
      };
    }

    if (!regra.pattern.test(cleaned)) {
      return { success: false, data: null, errors: [`Formato inválido para ${ufUpper}. Formato esperado: ${regra.format}`] };
    }

    return {
      success: true,
      data: {
        uf: ufUpper,
        formato: regra.format,
      },
    };
  }

  validarCep(cep: string) {
    const cleaned = cep.replace(/\D/g, '');
    if (cleaned.length !== 8) {
      return { success: false, data: null, errors: ['CEP deve ter 8 dígitos'] };
    }
    return {
      success: true,
      data: {
        formato: 'XXXXX-XXX',
        mascarado: `${cleaned.slice(0, 5)}-${cleaned.slice(5, 8)}`,
      },
    };
  }

  async validarNcm(ncm: string) {
    const cleaned = ncm.replace(/\D/g, '');
    if (cleaned.length !== 8) {
      return { success: false, data: null, errors: ['NCM deve ter 8 dígitos'] };
    }

    const existente = await this.prisma.ncm.findUnique({ where: { codigo: cleaned } });
    if (!existente) {
      return { success: false, data: null, errors: ['NCM não encontrado na base'] };
    }

    return { success: true, data: existente };
  }

  async validarCfop(cfop: string, tipo?: string) {
    const cleaned = cfop.replace(/\D/g, '');
    if (cleaned.length !== 4) {
      return { success: false, data: null, errors: ['CFOP deve ter 4 dígitos'] };
    }

    const where: any = { codigo: cleaned };
    if (tipo) where.tipo = tipo.toUpperCase();

    const existente = await this.prisma.cfop.findFirst({ where });
    if (!existente) {
      const msg = tipo
        ? `CFOP ${cleaned} não encontrado para operação de ${tipo}`
        : `CFOP ${cleaned} não encontrado`;
      return { success: false, data: null, errors: [msg] };
    }

    return { success: true, data: existente };
  }
}
