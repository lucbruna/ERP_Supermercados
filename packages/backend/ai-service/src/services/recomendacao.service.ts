import { Injectable, Logger } from '@nestjs/common';
import { TipoRecomendacao, PrioridadeRecomendacao } from '@prisma/client';

export interface Recomendacao {
  tipo: TipoRecomendacao;
  produtoId: string;
  acao: string;
  prioridade: PrioridadeRecomendacao;
  motivo: string;
  data: Date;
}

@Injectable()
export class RecomendacaoService {
  private readonly logger = new Logger(RecomendacaoService.name);

  async generate(tipo?: TipoRecomendacao, produtoId?: string): Promise<Recomendacao[]> {
    this.logger.log(`Generating recommendations - type: ${tipo || 'all'}, product: ${produtoId || 'any'}`);

    const recomendacoes: Recomendacao[] = [];
    const tipos = tipo ? [tipo] : Object.values(TipoRecomendacao);

    for (const t of tipos) {
      const recs = this.generateByType(t, produtoId);
      recomendacoes.push(...recs);
    }

    return recomendacoes;
  }

  private generateByType(tipo: TipoRecomendacao, produtoId?: string): Recomendacao[] {
    const recs: Recomendacao[] = [];
    const pid = produtoId || `prod-${Math.random().toString(36).substr(2, 9)}`;

    switch (tipo) {
      case 'COMPRA':
        recs.push({
          tipo: TipoRecomendacao.COMPRA,
          produtoId: pid,
          acao: `Comprar ${Math.floor(Math.random() * 1000) + 100} unidades`,
          prioridade: PrioridadeRecomendacao.MEDIA,
          motivo: 'Estoque abaixo do nível mínimo recomendado',
          data: new Date(),
        });
        break;

      case 'PROMOCAO':
        recs.push({
          tipo: TipoRecomendacao.PROMOCAO,
          produtoId: pid,
          acao: 'Criar promoção de 15% de desconto',
          prioridade: PrioridadeRecomendacao.ALTA,
          motivo: 'Produto com baixo giro nas últimas 2 semanas',
          data: new Date(),
        });
        break;

      case 'PRECO':
        recs.push({
          tipo: TipoRecomendacao.PRECO,
          produtoId: pid,
          acao: `Ajustar preço para R$ ${(Math.random() * 50 + 5).toFixed(2)}`,
          prioridade: PrioridadeRecomendacao.BAIXA,
          motivo: 'Preço abaixo da média do mercado',
          data: new Date(),
        });
        break;

      case 'ESTOQUE':
        recs.push({
          tipo: TipoRecomendacao.ESTOQUE,
          produtoId: pid,
          acao: 'Realizar inventário e reposição',
          prioridade: PrioridadeRecomendacao.ALTA,
          motivo: 'Produto com alta saída e estoque crítico',
          data: new Date(),
        });
        break;
    }

    return recs;
  }
}
