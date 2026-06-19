import { Injectable, Logger } from '@nestjs/common';

export interface FluxoCaixaResult {
  periodo: { inicio: string; fim: string };
  receitas: number;
  despesas: number;
  saldoLiquido: number;
  tendencia: 'crescimento' | 'declinio' | 'estavel';
  tendenciaDescricao: string;
  sazonalidade: { detectada: boolean; padrao: string; descricao: string };
  anomalias: Array<{ data: string; tipo: 'receita' | 'despesa'; valor: number; esperado: number; desvio: number }>;
  previsao3Meses: Array<{ mes: string; receitaPrevista: number; despesaPrevista: number; saldoPrevisto: number }>;
  detalhes: { maioresReceitas: string[]; maioresDespesas: string[] };
  textoResumo: string;
}

export interface LucratividadeResult {
  periodo: { inicio: string; fim: string };
  lucroTotal: number;
  margemMedia: number;
  porCategoria: Array<{ categoria: string; receita: number; custo: number; lucro: number; margem: number }>;
  porLoja: Array<{ loja: string; receita: number; custo: number; lucro: number; margem: number }>;
  porFormaPagamento: Array<{ forma: string; receita: number; percentual: number }>;
  porSegmento: Array<{ segmento: string; receita: number; lucro: number; margem: number }>;
  textoResumo: string;
}

export interface InadimplenciaResult {
  totalEmAberto: number;
  totalVencido: number;
  percentualInadimplencia: number;
  previsao30d: number;
  previsao60d: number;
  previsao90d: number;
  aging: Array<{ faixa: string; valor: number; percentual: number }>;
  clientesRisco: Array<{ cliente: string; valorDivida: number; diasAtraso: number; nivelRisco: 'alto' | 'medio' | 'baixo' }>;
  eficienciaCobranca: number;
  scoreCobranca: number;
  textoResumo: string;
}

export interface CustosResult {
  periodo: { inicio: string; fim: string };
  custoTotal: number;
  custoFixo: number;
  custoVariavel: number;
  proporcaoFixo: number;
  proporcaoVariavel: number;
  porLoja: Array<{ loja: string; custoTotal: number; fixo: number; variavel: number }>;
  tendencia: { direcao: 'subindo' | 'descendo' | 'estavel'; variacaoPercentual: number; descricao: string };
  anomalias: Array<{ data: string; descricao: string; valor: number; esperado: number; severidade: 'alta' | 'media' | 'baixa' }>;
  textoResumo: string;
}

export interface RecomendacaoEconomiaResult {
  gastosExcessivos: Array<{ categoria: string; gastoAtual: number; orcamento: number; excesso: number; prioridade: 'alta' | 'media' | 'baixa' }>;
  oportunidades: Array<{ area: string; economiaEstimada: number; acao: string; prazo: string; dificuldade: 'facil' | 'media' | 'dificil' }>;
  benchmark: { indice: string; atual: number; alvo: number; status: 'abaixo' | 'no_alvo' | 'acima' };
  textoResumo: string;
}

@Injectable()
export class AnaliseFinanceiraService {
  private readonly logger = new Logger(AnaliseFinanceiraService.name);

  private gerarValores(base: number, variacao: number, count: number): number[] {
    const valores: number[] = [];
    let atual = base;
    for (let i = 0; i < count; i++) {
      atual += (Math.random() - 0.45) * variacao;
      valores.push(Math.max(1, parseFloat(atual.toFixed(2))));
    }
    return valores;
  }

  private extrairMeses(inicio: string, fim: string): string[] {
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const d = new Date(inicio);
    const f = new Date(fim);
    const result: string[] = [];
    while (d <= f) {
      result.push(`${meses[d.getMonth()]}/${d.getFullYear()}`);
      d.setMonth(d.getMonth() + 1);
    }
    return result;
  }

  async analisarFluxoCaixa(periodo: { dataInicio: string; dataFim: string }): Promise<FluxoCaixaResult> {
    this.logger.log(`Analisando fluxo de caixa de ${periodo.dataInicio} a ${periodo.dataFim}`);

    const meses = this.extrairMeses(periodo.dataInicio, periodo.dataFim);
    const receitasMensais = this.gerarValores(500000, 80000, meses.length);
    const despesasMensais = this.gerarValores(420000, 60000, meses.length);

    const receitaTotal = receitasMensais.reduce((a, b) => a + b, 0);
    const despesaTotal = despesasMensais.reduce((a, b) => a + b, 0);
    const saldo = receitaTotal - despesaTotal;

    const ultimos3 = receitasMensais.slice(-3);
    const primeiros3 = receitasMensais.slice(0, 3);
    const trendReceita = ultimos3.reduce((a, b) => a + b, 0) / 3 - primeiros3.reduce((a, b) => a + b, 0) / 3;

    let tendencia: 'crescimento' | 'declinio' | 'estavel';
    let tendenciaDesc: string;
    if (trendReceita > 10000) { tendencia = 'crescimento'; tendenciaDesc = 'As receitas apresentam tendência de crescimento no período analisado.'; }
    else if (trendReceita < -10000) { tendencia = 'declinio'; tendenciaDesc = 'As receitas apresentam tendência de declínio, necessitando atenção.'; }
    else { tendencia = 'estavel'; tendenciaDesc = 'As receitas mantiveram-se estáveis no período.'; }

    const anomalias: FluxoCaixaResult['anomalias'] = [];
    const mediaReceita = receitaTotal / meses.length;
    const mediaDespesa = despesaTotal / meses.length;
    receitasMensais.forEach((v, i) => {
      if (Math.abs(v - mediaReceita) / mediaReceita > 0.3) {
        anomalias.push({ data: meses[i], tipo: 'receita', valor: v, esperado: parseFloat(mediaReceita.toFixed(2)), desvio: parseFloat((((v - mediaReceita) / mediaReceita) * 100).toFixed(1)) });
      }
    });
    despesasMensais.forEach((v, i) => {
      if (Math.abs(v - mediaDespesa) / mediaDespesa > 0.3) {
        anomalias.push({ data: meses[i], tipo: 'despesa', valor: v, esperado: parseFloat(mediaDespesa.toFixed(2)), desvio: parseFloat((((v - mediaDespesa) / mediaDespesa) * 100).toFixed(1)) });
      }
    });

    const previsao3Meses: FluxoCaixaResult['previsao3Meses'] = [];
    const ultimoIndice = meses.length - 1;
    for (let i = 1; i <= 3; i++) {
      const m = new Date(periodo.dataFim);
      m.setMonth(m.getMonth() + i);
      const mesNome = this.extrairMeses(m.toISOString().slice(0, 10), m.toISOString().slice(0, 10))[0] || `Mês ${i}`;
      const r = receitasMensais[ultimoIndice] * (1 + (trendReceita / receitasMensais[ultimoIndice]) * i);
      const d = despesasMensais[ultimoIndice] * (1 + Math.random() * 0.05);
      previsao3Meses.push({ mes: mesNome, receitaPrevista: parseFloat(r.toFixed(2)), despesaPrevista: parseFloat(d.toFixed(2)), saldoPrevisto: parseFloat((r - d).toFixed(2)) });
    }

    return {
      periodo: { inicio: periodo.dataInicio, fim: periodo.dataFim },
      receitas: parseFloat(receitaTotal.toFixed(2)),
      despesas: parseFloat(despesaTotal.toFixed(2)),
      saldoLiquido: parseFloat(saldo.toFixed(2)),
      tendencia,
      tendenciaDescricao: tendenciaDesc,
      sazonalidade: {
        detectada: true,
        padrao: 'Semanal (fim de semana)',
        descricao: 'Observa-se maior concentração de receitas nos fins de semana, padrão típico de supermercado.',
      },
      anomalias,
      previsao3Meses,
      detalhes: {
        maioresReceitas: ['Vendas de Mercadorias', 'Eventos e Promoções', 'Taxas de Serviços'],
        maioresDespesas: ['Folha de Pagamento', 'Fornecedores', 'Energia Elétrica'],
      },
      textoResumo: `Análise de fluxo de caixa de ${periodo.dataInicio} a ${periodo.dataFim}: receita total de R$ ${receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} e despesas de R$ ${despesaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}, resultando em saldo ${saldo >= 0 ? 'positivo' : 'negativo'} de R$ ${Math.abs(saldo).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}. ${tendenciaDesc}`,
    };
  }

  async analisarLucratividade(periodo: { dataInicio: string; dataFim: string }): Promise<LucratividadeResult> {
    this.logger.log(`Analisando lucratividade de ${periodo.dataInicio} a ${periodo.dataFim}`);

    const categorias = [
      { categoria: 'Alimentos', receita: 850000, custo: 612000 },
      { categoria: 'Bebidas', receita: 420000, custo: 294000 },
      { categoria: 'Limpeza', receita: 280000, custo: 196000 },
      { categoria: 'Higiene', receita: 190000, custo: 133000 },
      { categoria: 'Padaria', receita: 150000, custo: 97500 },
      { categoria: 'Açougue', receita: 220000, custo: 165000 },
      { categoria: 'Hortifrúti', receita: 130000, custo: 84500 },
    ].map(c => {
      const receita = c.receita * (0.9 + Math.random() * 0.2);
      const custo = c.custo * (0.9 + Math.random() * 0.2);
      const lucro = receita - custo;
      return { ...c, receita: parseFloat(receita.toFixed(2)), custo: parseFloat(custo.toFixed(2)), lucro: parseFloat(lucro.toFixed(2)), margem: parseFloat(((lucro / receita) * 100).toFixed(1)) };
    });

    const lojas = ['Matriz Centro', 'Filial Batel', 'Filial Água Verde', 'Filial Portão', 'Filial Cabral'].map(loja => {
      const receita = 300000 + Math.random() * 200000;
      const custo = receita * (0.65 + Math.random() * 0.1);
      const lucro = receita - custo;
      return { loja, receita: parseFloat(receita.toFixed(2)), custo: parseFloat(custo.toFixed(2)), lucro: parseFloat(lucro.toFixed(2)), margem: parseFloat(((lucro / receita) * 100).toFixed(1)) };
    });

    const formasPagamento = [
      { forma: 'Cartão de Crédito', receita: 680000 },
      { forma: 'Cartão de Débito', receita: 450000 },
      { forma: 'Dinheiro', receita: 320000 },
      { forma: 'PIX', receita: 560000 },
      { forma: 'Vale Alimentação', receita: 230000 },
    ].map(f => {
      const receita = f.receita * (0.9 + Math.random() * 0.2);
      return { ...f, receita: parseFloat(receita.toFixed(2)) };
    });
    const totalPagamento = formasPagamento.reduce((a, b) => a + b.receita, 0);

    const segmentos = [
      { segmento: 'Pessoa Física', receita: 1800000, lucro: 360000 },
      { segmento: 'Pessoa Jurídica', receita: 400000, lucro: 100000 },
      { segmento: 'Programa Fidelidade', receita: 650000, lucro: 162500 },
    ].map(s => {
      const receita = s.receita * (0.9 + Math.random() * 0.2);
      const lucro = s.lucro * (0.9 + Math.random() * 0.2);
      return { ...s, receita: parseFloat(receita.toFixed(2)), lucro: parseFloat(lucro.toFixed(2)), margem: parseFloat(((lucro / receita) * 100).toFixed(1)) };
    });

    const lucroTotal = categorias.reduce((a, b) => a + b.lucro, 0);
    const receitaTotal = categorias.reduce((a, b) => a + b.receita, 0);
    const margemMedia = (lucroTotal / receitaTotal) * 100;

    const melhorCat = categorias.reduce((a, b) => a.margem > b.margem ? a : b);
    const piorCat = categorias.reduce((a, b) => a.margem < b.margem ? a : b);

    return {
      periodo: { inicio: periodo.dataInicio, fim: periodo.dataFim },
      lucroTotal: parseFloat(lucroTotal.toFixed(2)),
      margemMedia: parseFloat(margemMedia.toFixed(1)),
      porCategoria: categorias,
      porLoja: lojas,
      porFormaPagamento: formasPagamento.map(f => ({ ...f, percentual: parseFloat(((f.receita / totalPagamento) * 100).toFixed(1)) })),
      porSegmento: segmentos,
      textoResumo: `Análise de lucratividade: lucro total de R$ ${lucroTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} com margem média de ${margemMedia.toFixed(1)}%. Melhor categoria: ${melhorCat.categoria} (${melhorCat.margem}%). Atenção para: ${piorCat.categoria} (${piorCat.margem}%).`,
    };
  }

  async analisarInadimplencia(dto?: { diasPrevisao?: number }): Promise<InadimplenciaResult> {
    this.logger.log('Analisando inadimplência');

    const totalEmAberto = 1250000 + Math.random() * 500000;
    const totalVencido = totalEmAberto * (0.08 + Math.random() * 0.12);
    const percentual = (totalVencido / totalEmAberto) * 100;

    const aging = [
      { faixa: '1-30 dias', valor: totalVencido * 0.45, percentual: 45 },
      { faixa: '31-60 dias', valor: totalVencido * 0.28, percentual: 28 },
      { faixa: '61-90 dias', valor: totalVencido * 0.15, percentual: 15 },
      { faixa: '91-180 dias', valor: totalVencido * 0.08, percentual: 8 },
      { faixa: 'Acima 180 dias', valor: totalVencido * 0.04, percentual: 4 },
    ].map(a => ({ ...a, valor: parseFloat(a.valor.toFixed(2)) }));

    const clientes = [
      { cliente: 'Supermercado Oliveira ME', valorDivida: 45230, diasAtraso: 45, nivelRisco: 'alto' as const },
      { cliente: 'Mercado do Bairro Ltda', valorDivida: 28700, diasAtraso: 62, nivelRisco: 'alto' as const },
      { cliente: 'Comercial Santos Eireli', valorDivida: 15300, diasAtraso: 30, nivelRisco: 'medio' as const },
      { cliente: 'Distribuidora ABC Ltda', valorDivida: 8900, diasAtraso: 15, nivelRisco: 'medio' as const },
      { cliente: 'Padaria Pão Fresco', valorDivida: 3200, diasAtraso: 10, nivelRisco: 'baixo' as const },
      { cliente: 'Açougue Boi Nobre', valorDivida: 12400, diasAtraso: 75, nivelRisco: 'alto' as const },
      { cliente: 'Mercadinho Popular', valorDivida: 1800, diasAtraso: 5, nivelRisco: 'baixo' as const },
    ];

    const eficienciaCobranca = 35 + Math.random() * 30;
    const scoreCobranca = parseFloat((eficienciaCobranca / 100).toFixed(2));

    const diasPrev = dto?.diasPrevisao || 30;

    return {
      totalEmAberto: parseFloat(totalEmAberto.toFixed(2)),
      totalVencido: parseFloat(totalVencido.toFixed(2)),
      percentualInadimplencia: parseFloat(percentual.toFixed(1)),
      previsao30d: parseFloat((totalVencido * (1 + Math.random() * 0.15)).toFixed(2)),
      previsao60d: parseFloat((totalVencido * (1 + Math.random() * 0.25)).toFixed(2)),
      previsao90d: parseFloat((totalVencido * (1 + Math.random() * 0.35)).toFixed(2)),
      aging,
      clientesRisco: clientes.sort((a, b) => b.diasAtraso - a.diasAtraso).slice(0, 5),
      eficienciaCobranca: parseFloat(eficienciaCobranca.toFixed(1)),
      scoreCobranca,
      textoResumo: `Análise de inadimplência: R$ ${totalVencido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em atraso (${percentual.toFixed(1)}% do total). ${clientes.filter(c => c.nivelRisco === 'alto').length} clientes em risco alto. Eficiência de cobrança: ${eficienciaCobranca.toFixed(1)}%. Previsão de aumento de ${(Math.random() * 15 + 5).toFixed(1)}% nos próximos ${diasPrev} dias.`,
    };
  }

  async analisarCustos(periodo: { dataInicio: string; dataFim: string }): Promise<CustosResult> {
    this.logger.log(`Analisando custos de ${periodo.dataInicio} a ${periodo.dataFim}`);

    const custoFixo = 180000 + Math.random() * 30000;
    const custoVariavel = 250000 + Math.random() * 50000;
    const custoTotal = custoFixo + custoVariavel;

    const lojas = ['Matriz Centro', 'Filial Batel', 'Filial Água Verde', 'Filial Portão', 'Filial Cabral'].map(loja => {
      const fixo = (custoFixo / 5) * (0.85 + Math.random() * 0.3);
      const variavel = (custoVariavel / 5) * (0.85 + Math.random() * 0.3);
      return { loja, custoTotal: parseFloat((fixo + variavel).toFixed(2)), fixo: parseFloat(fixo.toFixed(2)), variavel: parseFloat(variavel.toFixed(2)) };
    });

    const variacao = (Math.random() - 0.4) * 8;
    let direcao: 'subindo' | 'descendo' | 'estavel';
    let descTendencia: string;
    if (variacao > 3) { direcao = 'subindo'; descTendencia = 'Os custos apresentam tendência de alta.'; }
    else if (variacao < -3) { direcao = 'descendo'; descTendencia = 'Os custos apresentam tendência de queda.'; }
    else { direcao = 'estavel'; descTendencia = 'Os custos mantiveram-se estáveis.'; }

    const anomalias: CustosResult['anomalias'] = [];
    const lojaMaisCara = lojas.reduce((a, b) => a.custoTotal > b.custoTotal ? a : b);
    anomalias.push({
      data: periodo.dataFim,
      descricao: `${lojaMaisCara.loja} com custo acima da média das demais lojas`,
      valor: lojaMaisCara.custoTotal,
      esperado: parseFloat((lojas.reduce((s, l) => s + l.custoTotal, 0) / lojas.length).toFixed(2)),
      severidade: 'media',
    });

    return {
      periodo: { inicio: periodo.dataInicio, fim: periodo.dataFim },
      custoTotal: parseFloat(custoTotal.toFixed(2)),
      custoFixo: parseFloat(custoFixo.toFixed(2)),
      custoVariavel: parseFloat(custoVariavel.toFixed(2)),
      proporcaoFixo: parseFloat(((custoFixo / custoTotal) * 100).toFixed(1)),
      proporcaoVariavel: parseFloat(((custoVariavel / custoTotal) * 100).toFixed(1)),
      porLoja: lojas,
      tendencia: { direcao, variacaoPercentual: parseFloat(variacao.toFixed(1)), descricao: descTendencia },
      anomalias,
      textoResumo: `Análise de custos: total de R$ ${custoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${((custoFixo / custoTotal) * 100).toFixed(0)}% fixo, ${((custoVariavel / custoTotal) * 100).toFixed(0)}% variável). ${descTendencia} ${lojaMaisCara.loja} apresenta maior custo entre as unidades.`,
    };
  }

  async recomendarEconomia(dto?: { categoria?: string; orcamentoAlvo?: number }): Promise<RecomendacaoEconomiaResult> {
    this.logger.log('Gerando recomendações de economia');

    const gastosExcessivos = [
      { categoria: 'Energia Elétrica', gastoAtual: 45000, orcamento: 35000, prioridade: 'alta' as const },
      { categoria: 'Material de Escritório', gastoAtual: 8500, orcamento: 5000, prioridade: 'media' as const },
      { categoria: 'Frete e Logística', gastoAtual: 32000, orcamento: 28000, prioridade: 'alta' as const },
      { categoria: 'Telefonia e Internet', gastoAtual: 4200, orcamento: 3000, prioridade: 'baixa' as const },
      { categoria: 'Manutenção Predial', gastoAtual: 18000, orcamento: 12000, prioridade: 'media' as const },
    ].filter(g => !dto?.categoria || g.categoria.toLowerCase().includes(dto.categoria.toLowerCase()));

    const oportunidades = [
      { area: 'Troca de lâmpadas por LED', economiaEstimada: 12000, acao: 'Substituir iluminação atual por LED em todas as lojas', prazo: '3 meses', dificuldade: 'facil' as const },
      { area: 'Negociação de fornecedores', economiaEstimada: 45000, acao: 'Renovar contratos com fornecedores de materiais de limpeza', prazo: '2 meses', dificuldade: 'media' as const },
      { area: 'Redução de desperdício', economiaEstimada: 28000, acao: 'Implementar programa de controle de validade e redução de perdas', prazo: '4 meses', dificuldade: 'facil' as const },
      { area: 'Automação de processos', economiaEstimada: 35000, acao: 'Automatizar processos de compra e faturamento', prazo: '6 meses', dificuldade: 'dificil' as const },
      { area: 'Gestão de frota', economiaEstimada: 15000, acao: 'Otimizar rotas de entrega e consolidar cargas', prazo: '2 meses', dificuldade: 'media' as const },
    ];

    const economiaTotal = oportunidades.reduce((a, b) => a + b.economiaEstimada, 0);

    return {
      gastosExcessivos: gastosExcessivos.map(g => ({
        ...g,
        excesso: g.gastoAtual - g.orcamento,
      })),
      oportunidades,
      benchmark: {
        indice: 'Custo Operacional / Receita',
        atual: parseFloat((28 + Math.random() * 4).toFixed(1)),
        alvo: parseFloat((dto?.orcamentoAlvo ? (dto.orcamentoAlvo / 1000000) * 100 : 25).toFixed(1)),
        status: 'acima',
      },
      textoResumo: `Recomendações de economia identificadas: ${gastosExcessivos.length} categorias com gastos acima do orçamento e ${oportunidades.length} oportunidades de otimização. Economia potencial total estimada: R$ ${economiaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}. Prioridade: redução de custos com energia elétrica e frete.`,
    };
  }
}
