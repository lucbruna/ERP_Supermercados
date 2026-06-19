import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

export interface RegraCashback {
  tipo: 'PERCENTUAL' | 'FIXO' | 'TABELA_PROGRESSIVA';
  percentual?: number;
  valorFixo?: number;
  faixas?: { minimo: number; maximo: number; percentual: number }[];
  valorMinimoCompra?: number;
  categoriaProduto?: string;
}

export interface CalcularCashbackInput {
  companyId: string;
  clienteId: string;
  valorCompra: number;
  categoriaProduto?: string;
}

export interface CalcularCashbackOutput {
  valor: number;
  regraAplicada: RegraCashback;
  programaId: string;
  descricao: string;
}

@Injectable()
export class CashbackService {
  private readonly logger = new Logger(CashbackService.name);

  constructor(private readonly prisma: PrismaService) {}

  async calcular(input: CalcularCashbackInput): Promise<CalcularCashbackOutput | null> {
    const programas = await this.prisma.fidelidadePrograma.findMany({
      where: {
        companyId: input.companyId,
        tipo: 'CASHBACK',
        ativo: true,
      },
    });

    for (const programa of programas) {
      const regras = programa.regras as unknown as RegraCashback[];
      for (const regra of regras) {
        if (this.regraAplicavel(regra, input)) {
          const valor = this.calcularValor(regra, input.valorCompra);
          if (valor > 0) {
            return {
              valor,
              regraAplicada: regra,
              programaId: programa.id,
              descricao: `Cashback de ${this.formatarDescricao(regra, valor)} - ${programa.nome}`,
            };
          }
        }
      }
    }

    return null;
  }

  private regraAplicavel(regra: RegraCashback, input: CalcularCashbackInput): boolean {
    if (regra.valorMinimoCompra && input.valorCompra < regra.valorMinimoCompra) {
      return false;
    }
    if (regra.categoriaProduto && input.categoriaProduto !== regra.categoriaProduto) {
      return false;
    }
    return true;
  }

  private calcularValor(regra: RegraCashback, valorCompra: number): number {
    switch (regra.tipo) {
      case 'PERCENTUAL':
        return Number((valorCompra * (regra.percentual || 0) / 100).toFixed(2));
      case 'FIXO':
        return regra.valorFixo || 0;
      case 'TABELA_PROGRESSIVA':
        if (regra.faixas) {
          for (const faixa of regra.faixas) {
            if (valorCompra >= faixa.minimo && valorCompra <= faixa.maximo) {
              return Number((valorCompra * faixa.percentual / 100).toFixed(2));
            }
          }
        }
        return 0;
      default:
        return 0;
    }
  }

  private formatarDescricao(regra: RegraCashback, valor: number): string {
    switch (regra.tipo) {
      case 'PERCENTUAL':
        return `${regra.percentual}% (R$ ${valor.toFixed(2)})`;
      case 'FIXO':
        return `R$ ${valor.toFixed(2)} fixo`;
      case 'TABELA_PROGRESSIVA':
        return `R$ ${valor.toFixed(2)} (tabela progressiva)`;
      default:
        return `R$ ${valor.toFixed(2)}`;
    }
  }
}
