import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

export interface RegraPontuacao {
  tipo: 'FIXO_POR_VALOR' | 'PERCENTUAL' | 'MULTIPLICADOR' | 'TABELA_PROGRESSIVA';
  pontosPorReal?: number;
  percentual?: number;
  multiplicador?: number;
  faixas?: { minimo: number; maximo: number; pontosPorReal: number }[];
  valorMinimoCompra?: number;
  categoriaProduto?: string;
  maximoPontos?: number;
}

export interface CalcularPontosInput {
  companyId: string;
  clienteId: string;
  valorCompra: number;
  categoriaProduto?: string;
}

export interface CalcularPontosOutput {
  pontos: number;
  regraAplicada: RegraPontuacao;
  programaId: string;
  descricao: string;
}

@Injectable()
export class PontuacaoService {
  private readonly logger = new Logger(PontuacaoService.name);

  constructor(private readonly prisma: PrismaService) {}

  async calcular(input: CalcularPontosInput): Promise<CalcularPontosOutput | null> {
    const programas = await this.prisma.fidelidadePrograma.findMany({
      where: {
        companyId: input.companyId,
        tipo: 'PONTOS',
        ativo: true,
      },
    });

    for (const programa of programas) {
      const regras = programa.regras as unknown as RegraPontuacao[];
      for (const regra of regras) {
        if (this.regraAplicavel(regra, input)) {
          const pontosBrutos = this.calcularPontos(regra, input.valorCompra);
          const pontos = regra.maximoPontos
            ? Math.min(pontosBrutos, regra.maximoPontos)
            : pontosBrutos;

          if (pontos > 0) {
            return {
              pontos,
              regraAplicada: regra,
              programaId: programa.id,
              descricao: `${pontos} pontos - ${programa.nome}`,
            };
          }
        }
      }
    }

    return null;
  }

  private regraAplicavel(regra: RegraPontuacao, input: CalcularPontosInput): boolean {
    if (regra.valorMinimoCompra && input.valorCompra < regra.valorMinimoCompra) {
      return false;
    }
    if (regra.categoriaProduto && input.categoriaProduto !== regra.categoriaProduto) {
      return false;
    }
    return true;
  }

  private calcularPontos(regra: RegraPontuacao, valorCompra: number): number {
    switch (regra.tipo) {
      case 'FIXO_POR_VALOR':
        return Math.floor(valorCompra * (regra.pontosPorReal || 1));
      case 'PERCENTUAL':
        return Math.floor(valorCompra * (regra.percentual || 0) / 100);
      case 'MULTIPLICADOR':
        return Math.floor(valorCompra * (regra.multiplicador || 1));
      case 'TABELA_PROGRESSIVA':
        if (regra.faixas) {
          for (const faixa of regra.faixas) {
            if (valorCompra >= faixa.minimo && valorCompra <= faixa.maximo) {
              return Math.floor(valorCompra * faixa.pontosPorReal);
            }
          }
        }
        return 0;
      default:
        return 0;
    }
  }
}
