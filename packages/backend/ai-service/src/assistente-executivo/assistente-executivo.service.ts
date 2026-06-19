import { Injectable, Logger } from '@nestjs/common';

export interface PerguntaResult {
  perguntaOriginal: string;
  intent: string;
  intentDescricao: string;
  confianca: number;
  entidadesExtraidas: Array<{ tipo: string; valor: string }>;
  resposta: string;
  dadosEstruturados?: Record<string, any>;
  sugestoesFollowUp?: string[];
  sessionId?: string;
}

export interface SentimentoResult {
  texto: string;
  sentimento: 'positivo' | 'negativo' | 'neutro';
  score: number;
  polaridade: number;
  analise: string;
}

export interface SugestaoResult {
  sugestoes: Array<{
    titulo: string;
    descricao: string;
    prioridade: 'alta' | 'media' | 'baixa';
    departamento: string;
    acao: string;
  }>;
  contexto: string;
}

export interface ResumoDiarioResult {
  data: string;
  eventosOntem: string[];
  prioridadesHoje: string[];
  alertas: Array<{
    tipo: 'critico' | 'atencao' | 'informativo';
    mensagem: string;
  }>;
  indicadoresRapidos: Array<{
    nome: string;
    valor: string;
    variacao: string;
  }>;
  textoCompleto: string;
}

@Injectable()
export class AssistenteExecutivoService {
  private readonly logger = new Logger(AssistenteExecutivoService.name);

  private readonly contextos: Map<string, { ultimaPergunta: string; ultimoIntent: string; dados: Record<string, any> }> = new Map();

  private classificarIntent(pergunta: string): { intent: string; descricao: string; confianca: number } {
    const lower = pergunta.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const regras: Array<{ pattern: RegExp; intent: string; descricao: string }> = [
      { pattern: /(faturamento|receita|vendas|vendido|vendeu|faturou|quanto.*vendeu|receita.*ontem|faturamento.*ontem)/, intent: 'financeiro', descricao: 'Consulta financeira' },
      { pattern: /(estoque|falta|acabou|repor|reposicao|baixo|produto.*faltando|precisa.*comprar|ruptura)/, intent: 'estoque', descricao: 'Consulta de estoque' },
      { pattern: /(funcionario|funcionário|ferias|férias|afastado|colaborador|salario|salário|ponto|hr|rh|departamento)/, intent: 'rh', descricao: 'Consulta de recursos humanos' },
      { pattern: /(promocao|promoção|marketing|propaganda|campanha|anuncio|anúncio|publicidade)/, intent: 'marketing', descricao: 'Consulta de marketing' },
      { pattern: /(melhor|pior|desempenho|loja.*desempenho|unidade.*resultado|rank|ranking|comparar)/, intent: 'vendas', descricao: 'Análise comparativa de vendas' },
      { pattern: /(lucro|lucratividade|margem|rentabilidade|custo|despesa|gasto)/, intent: 'financeiro', descricao: 'Análise financeira' },
      { pattern: /(cliente|inadimplencia|inadimplência|divida|dívida|atraso|cobranca|cobrança)/, intent: 'financeiro', descricao: 'Análise de clientes' },
      { pattern: /(ontem|hoje|semana|mês|mes|passado|anterior|atual|ultimo|último)/, intent: 'vendas', descricao: 'Comparação de períodos' },
    ];

    for (const r of regras) {
      if (r.pattern.test(lower)) {
        const confianca = 0.6 + Math.random() * 0.35;
        return { intent: r.intent, descricao: r.descricao, confianca: parseFloat(confianca.toFixed(4)) };
      }
    }

    return { intent: 'generico', descricao: 'Consulta geral', confianca: 0.4 };
  }

  private extrairEntidades(pergunta: string): Array<{ tipo: string; valor: string }> {
    const entidades: Array<{ tipo: string; valor: string }> = [];
    const lower = pergunta.toLowerCase();

    const datas = pergunta.match(/(\d{2}\/\d{2}\/\d{4})|(\d{4}-\d{2}-\d{2})|(ontem|hoje|amanha|semana\s+passada|mês\s+passado|esse\s+mês)/gi);
    if (datas) datas.forEach(d => entidades.push({ tipo: 'data', valor: d }));

    const valores = pergunta.match(/(?:R\$\s*)?(\d+(?:\.\d{3})*(?:,\d{2})?)/g);
    if (valores) valores.forEach(v => entidades.push({ tipo: 'valor', valor: v }));

    const lojas = ['matriz', 'batel', 'água verde', 'portão', 'cabral', 'centro'];
    lojas.forEach(loja => {
      if (lower.includes(loja)) entidades.push({ tipo: 'loja', valor: loja });
    });

    return entidades;
  }

  async perguntar(dto: { pergunta: string; usuario?: string; sessionId?: string }): Promise<PerguntaResult> {
    this.logger.log(`Processando pergunta: "${dto.pergunta}" (usuário: ${dto.usuario || 'anonimo'})`);

    const classification = this.classificarIntent(dto.pergunta);
    const entidades = this.extrairEntidades(dto.pergunta);

    if (dto.sessionId) {
      const ctx = this.contextos.get(dto.sessionId);
      if (ctx) {
        ctx.ultimaPergunta = dto.pergunta;
        ctx.ultimoIntent = classification.intent;
      } else {
        this.contextos.set(dto.sessionId, { ultimaPergunta: dto.pergunta, ultimoIntent: classification.intent, dados: {} });
      }
    }

    const lower = dto.pergunta.toLowerCase();
    let resposta: string;
    let dadosEstruturados: Record<string, any> | undefined;

    switch (classification.intent) {
      case 'financeiro': {
        if (lower.includes('faturamento') || lower.includes('receita') || lower.includes('vendas') || lower.includes('vendeu')) {
          const valor = 85000 + Math.random() * 30000;
          const variacao = -3 + Math.random() * 10;
          resposta = `O faturamento${lower.includes('ontem') ? ' de ontem' : ''} foi de R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}. ${variacao >= 0 ? `Um aumento de ${variacao.toFixed(1)}%` : `Uma queda de ${Math.abs(variacao).toFixed(1)}%`} em comparação com o período anterior.`;
          dadosEstruturados = { faturamento: parseFloat(valor.toFixed(2)), variacao: parseFloat(variacao.toFixed(1)), periodo: lower.includes('ontem') ? 'ontem' : 'período solicitado' };
        } else if (lower.includes('inadimplencia') || lower.includes('divida') || lower.includes('atraso')) {
          const perc = 4 + Math.random() * 6;
          resposta = `A taxa de inadimplência atual é de ${perc.toFixed(1)}%. Temos ${Math.floor(10 + Math.random() * 30)} clientes com pagamentos em atraso, totalizando aproximadamente R$ ${(50000 + Math.random() * 80000).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`;
          dadosEstruturados = { taxaInadimplencia: parseFloat(perc.toFixed(1)), valorTotalEmAtraso: parseFloat((50000 + Math.random() * 80000).toFixed(2)) };
        } else {
          const lucro = 18000 + Math.random() * 12000;
          resposta = `A margem de lucro atual é de ${(18 + Math.random() * 8).toFixed(1)}%. O lucro líquido do período é de aproximadamente R$ ${lucro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`;
          dadosEstruturados = { margemLucro: parseFloat((18 + Math.random() * 8).toFixed(1)), lucroLiquido: parseFloat(lucro.toFixed(2)) };
        }
        break;
      }
      case 'estoque': {
        const produtosBaixos = ['Leite Integral 1L', 'Café Torrado 500g', 'Pão de Forma', 'Cerveja Lata 350ml', 'Papel Higiênico 12un'];
        const selecionados = produtosBaixos.slice(0, 3 + Math.floor(Math.random() * 2));
        resposta = `Produtos com estoque baixo: ${selecionados.join(', ')}. Recomendo realizar pedido de compra urgente para evitar ruptura. O valor estimado para reposição é de R$ ${(8000 + Math.random() * 12000).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`;
        dadosEstruturados = { produtosCriticos: selecionados, valorReposicao: parseFloat((8000 + Math.random() * 12000).toFixed(2)) };
        break;
      }
      case 'rh': {
        if (lower.includes('ferias') || lower.includes('férias')) {
          const funcFerias = ['Ana Silva', 'Carlos Oliveira', 'Mariana Santos', 'João Pedro Costa', 'Juliana Lima'];
          const qtd = 1 + Math.floor(Math.random() * 4);
          resposta = `${qtd} funcionários estão de férias este mês: ${funcFerias.slice(0, qtd).join(', ')}${qtd > 3 ? ' e outros' : ''}.`;
          dadosEstruturados = { funcionariosFerias: funcFerias.slice(0, qtd), quantidade: qtd };
        } else {
          resposta = `Temos um total de ${180 + Math.floor(Math.random() * 40)} funcionários ativos. A taxa de absenteísmo do mês é de ${(3 + Math.random() * 4).toFixed(1)}%. O departamento com maior número de colaboradores é Operações.`;
          dadosEstruturados = { totalFuncionarios: 180 + Math.floor(Math.random() * 40), absenteismo: parseFloat((3 + Math.random() * 4).toFixed(1)) };
        }
        break;
      }
      case 'marketing': {
        resposta = `Atualmente temos ${2 + Math.floor(Math.random() * 3)} campanhas ativas. A campanha "Promoção de Inverno" gerou um aumento de ${(5 + Math.random() * 15).toFixed(1)}% nas vendas da categoria. O ROI médio das campanhas é de ${(200 + Math.random() * 300).toFixed(0)}%.`;
        dadosEstruturados = { campanhasAtivas: 2 + Math.floor(Math.random() * 3), roiMedio: parseFloat((200 + Math.random() * 300).toFixed(0)) };
        break;
      }
      case 'vendas':
      default: {
        if (lower.includes('compar') || lower.includes('semana')) {
          const atual = 250000 + Math.random() * 50000;
          const anterior = 240000 + Math.random() * 50000;
          const diff = ((atual - anterior) / anterior) * 100;
          resposta = `Comparando esta semana com a passada: vendas atuais de R$ ${atual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} vs R$ ${anterior.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} na semana anterior. Variação de ${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%.`;
          dadosEstruturados = { vendasSemanaAtual: parseFloat(atual.toFixed(2)), vendasSemanaAnterior: parseFloat(anterior.toFixed(2)), variacao: parseFloat(diff.toFixed(1)) };
        } else if (lower.includes('melhor') || lower.includes('desempenho')) {
          const lojas = ['Matriz Centro', 'Filial Batel', 'Filial Água Verde', 'Filial Portão', 'Filial Cabral'];
          const melhor = lojas[Math.floor(Math.random() * lojas.length)];
          const fat = 400000 + Math.random() * 100000;
          resposta = `A loja com melhor desempenho no período foi ${melhor}, com faturamento de R$ ${fat.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} e margem de ${(20 + Math.random() * 8).toFixed(1)}%.`;
          dadosEstruturados = { melhorLoja: melhor, faturamento: parseFloat(fat.toFixed(2)) };
        } else {
          resposta = 'Desculpe, não entendi completamente sua pergunta. Você pode reformular? Posso ajudar com informações sobre: faturamento, estoque, funcionários, vendas, marketing e indicadores financeiros.';
        }
        break;
      }
    }

    const sugestoesFollowUp: string[] = [];
    if (classification.intent === 'financeiro') sugestoesFollowUp.push('Qual a previsão para o próximo mês?', 'Como está a inadimplência?', 'Quais os principais custos?');
    else if (classification.intent === 'estoque') sugestoesFollowUp.push('Qual o valor para reposição?', 'Quais categorias estão críticas?', 'Preciso autorizar compra?');
    else if (classification.intent === 'rh') sugestoesFollowUp.push('Quantos estão de férias?', 'Qual departamento tem maior absenteísmo?', 'Taxa de turnover?');
    else sugestoesFollowUp.push('Qual foi o faturamento de ontem?', 'Quais produtos estão com estoque baixo?', 'Compare vendas dessa semana com a passada');

    return {
      perguntaOriginal: dto.pergunta,
      intent: classification.intent,
      intentDescricao: classification.descricao,
      confianca: classification.confianca,
      entidadesExtraidas: entidades,
      resposta,
      dadosEstruturados,
      sugestoesFollowUp,
      sessionId: dto.sessionId,
    };
  }

  async analisarSentimento(dto: { texto: string }): Promise<SentimentoResult> {
    this.logger.log(`Analisando sentimento do texto: "${dto.texto.substring(0, 50)}..."`);

    const positivas = ['bom', 'ótimo', 'excelente', 'gostei', 'satisfeito', 'feliz', 'maravilhoso', 'adoro', 'perfeito', 'recomendo'];
    const negativas = ['ruim', 'péssimo', 'horrível', 'insatisfeito', 'triste', 'odeio', 'frustrado', 'lento', 'caro', 'quebrado'];

    const lower = dto.texto.toLowerCase();
    let score = 0.5;
    let countPos = 0, countNeg = 0;

    positivas.forEach(p => { if (lower.includes(p)) { score += 0.1; countPos++; } });
    negativas.forEach(n => { if (lower.includes(n)) { score -= 0.1; countNeg++; } });

    score = Math.max(0, Math.min(1, score));

    let sentimento: 'positivo' | 'negativo' | 'neutro';
    if (score > 0.65) sentimento = 'positivo';
    else if (score < 0.35) sentimento = 'negativo';
    else sentimento = 'neutro';

    const polaridade = parseFloat(((score - 0.5) * 2).toFixed(4));

    let analise: string;
    if (sentimento === 'positivo') analise = 'O texto transmite uma percepção positiva. O usuário demonstra satisfação.';
    else if (sentimento === 'negativo') analise = 'O texto transmite uma percepção negativa. Pode indicar insatisfação ou problema.';
    else analise = 'O texto é neutro ou misto, sem carga emocional clara.';

    return {
      texto: dto.texto,
      sentimento,
      score: parseFloat(score.toFixed(4)),
      polaridade,
      analise,
    };
  }

  async sugerirAcao(dto?: { contexto?: string; departamento?: string }): Promise<SugestaoResult> {
    this.logger.log('Gerando sugestões proativas');

    const sugestoes = [
      {
        titulo: 'Reposição de estoque necessária',
        descricao: 'Leite Integral 1L e Café Torrado 500g estão com estoque crítico. Necessário programar compra urgente.',
        prioridade: 'alta' as const,
        departamento: 'Compras',
        acao: 'Emitir pedido de compra para fornecedores de laticínios e alimentos.',
      },
      {
        titulo: 'Cliente com histórico de atraso',
        descricao: 'Supermercado Oliveira ME possui R$ 45.230,00 em aberto com 45 dias de atraso. Recomenda-se acionar cobrança.',
        prioridade: 'alta' as const,
        departamento: 'Financeiro',
        acao: 'Enviar notificação de cobrança e contatar cliente para negociação.',
      },
      {
        titulo: 'Promoção sazonal iminente',
        descricao: 'Com a chegada do inverno, recomenda-se iniciar campanha de promoção de vinhos e chocolates.',
        prioridade: 'media' as const,
        departamento: 'Marketing',
        acao: 'Criar material promocional e definir descontos para itens sazonais.',
      },
      {
        titulo: 'Análise de custos de energia',
        descricao: 'Custo de energia elétrica está 28% acima do orçado. Sugere-se auditoria energética.',
        prioridade: 'media' as const,
        departamento: 'Operações',
        acao: 'Contatar empresa de eficiência energética para avaliação.',
      },
      {
        titulo: 'Absenteísmo elevado em Logística',
        descricao: 'Departamento de Logística apresenta 6.5% de absenteísmo, acima da média da empresa.',
        prioridade: 'baixa' as const,
        departamento: 'RH',
        acao: 'Realizar pesquisa de clima organizacional no departamento.',
      },
    ];

    const filtradas = sugestoes.filter(s =>
      (!dto?.departamento || s.departamento.toLowerCase() === dto.departamento.toLowerCase()) &&
      (!dto?.contexto || s.titulo.toLowerCase().includes(dto.contexto.toLowerCase()) || s.descricao.toLowerCase().includes(dto.contexto.toLowerCase()))
    );

    return {
      sugestoes: filtradas.length > 0 ? filtradas : sugestoes,
      contexto: dto?.contexto || 'geral',
    };
  }

  async gerarResumoDiario(): Promise<ResumoDiarioResult> {
    this.logger.log('Gerando resumo diário');

    const hoje = new Date();
    const dataStr = hoje.toISOString().slice(0, 10);

    const faturamentoOntem = 85000 + Math.random() * 25000;

    const eventosOntem = [
      `Faturamento de R$ ${faturamentoOntem.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      `${Math.floor(300 + Math.random() * 200)} clientes atendidos`,
      `2 entregas realizadas para clientes corporativos`,
      `Pedido de reposição de estoque emitido para distribuidora de bebidas`,
      `Reunião de planejamento estratégico realizada às 14h`,
    ];

    const prioridadesHoje = [
      'Revisar indicadores de vendas da semana',
      'Aprovar campanha promocional de inverno',
      'Verificar pendências de cobrança com clientes em atraso',
      'Acompanhar recebimento de mercadorias do fornecedor',
    ];

    const alertas: ResumoDiarioResult['alertas'] = [
      { tipo: 'critico', mensagem: 'Estoque de leite e café está abaixo do mínimo. Programar compra urgente.' },
      { tipo: 'atencao', mensagem: `3 clientes com duplicatas vencendo hoje (total: R$ ${(8000 + Math.random() * 5000).toLocaleString('pt-BR', { minimumFractionDigits: 2 })})` },
      { tipo: 'informativo', mensagem: 'Campanha de marketing digital apresenta ROAS de 3.5x (acima da meta).' },
    ];

    return {
      data: dataStr,
      eventosOntem,
      prioridadesHoje,
      alertas,
      indicadoresRapidos: [
        { nome: 'Faturamento (ontem)', valor: `R$ ${faturamentoOntem.toFixed(2)}`, variacao: `${(Math.random() * 8 - 2).toFixed(1)}%` },
        { nome: 'Ticket Médio', valor: `R$ ${(42 + Math.random() * 12).toFixed(2)}`, variacao: `${(Math.random() * 5 - 1).toFixed(1)}%` },
        { nome: 'Clientes', valor: `${Math.floor(300 + Math.random() * 200)}`, variacao: `${(Math.random() * 10 - 3).toFixed(1)}%` },
        { nome: 'Satisfação', valor: `${(85 + Math.random() * 10).toFixed(0)}%`, variacao: `${(Math.random() * 3 - 0.5).toFixed(1)}pp` },
      ],
      textoCompleto: `RESUMO DIÁRIO - ${dataStr}\n\n✅ Ontem: Faturamento de R$ ${faturamentoOntem.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}. ${Math.floor(300 + Math.random() * 200)} clientes atendidos.\n\n📌 Hoje: Revisar indicadores, aprovar campanha, verificar cobranças.\n\n⚠️ Alertas: Estoque crítico de leite e café. Duplicatas vencendo hoje.\n\n📊 Indicadores: Ticket médio estável, satisfação dentro da meta.`,
    };
  }
}
