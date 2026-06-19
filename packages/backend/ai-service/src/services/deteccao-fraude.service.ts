import { Injectable, Logger } from '@nestjs/common';
import { TipoDeteccaoFraude } from '@prisma/client';

interface FraudResult {
  transacaoId?: string;
  tipo: TipoDeteccaoFraude;
  confianca: number;
  detalhes: any;
  data: Date;
  processado: boolean;
}

@Injectable()
export class DeteccaoFraudeService {
  private readonly logger = new Logger(DeteccaoFraudeService.name);

  async analyzeTransaction(
    transacaoId: string,
    valor: number,
    clienteId: string,
    localizacao: string,
  ): Promise<FraudResult> {
    this.logger.log(`Analyzing transaction ${transacaoId} for fraud patterns`);

    const fatoresRisco = [];
    let scoreRisco = 0;

    if (valor > 5000) {
      scoreRisco += 0.3;
      fatoresRisco.push({ fator: 'Valor acima de R$ 5.000', peso: 0.3 });
    }

    if (valor > 10000) {
      scoreRisco += 0.2;
      fatoresRisco.push({ fator: 'Valor acima de R$ 10.000', peso: 0.2 });
    }

    if (localizacao === 'DESCONHECIDA' || localizacao === 'EXTERIOR') {
      scoreRisco += 0.25;
      fatoresRisco.push({ fator: 'Localização incomum', peso: 0.25 });
    }

    scoreRisco += Math.random() * 0.2;
    scoreRisco = Math.min(1, scoreRisco);

    const tipo = this.classificarTipo(scoreRisco, valor);
    const confianca = parseFloat((scoreRisco * (0.8 + Math.random() * 0.2)).toFixed(4));

    return {
      transacaoId,
      tipo,
      confianca: Math.min(0.99, confianca),
      detalhes: {
        valor,
        clienteId,
        localizacao,
        fatoresRisco,
        scoreRisco: parseFloat(scoreRisco.toFixed(4)),
      },
      data: new Date(),
      processado: false,
    };
  }

  private classificarTipo(score: number, valor: number): TipoDeteccaoFraude {
    if (score > 0.7) return TipoDeteccaoFraude.VALOR_ANORMAL;
    if (score > 0.5) return TipoDeteccaoFraude.TRANSACAO_SUSPEITA;
    if (score > 0.3) return TipoDeteccaoFraude.PADRAO_ANORMAL;
    return TipoDeteccaoFraude.MULTIPLAS_TENTATIVAS;
  }
}
