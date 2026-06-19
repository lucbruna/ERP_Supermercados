import { Injectable, Logger } from '@nestjs/common';
import { GrupoRelatorio } from './relatorios-inteligentes.dto';

export interface RelatorioVendasResult {
  periodo: { inicio: string; fim: string };
  totalVendas: number;
  totalItens: number;
  ticketMedio: number;
  crescimentoPeriodoAnterior: number;
  topProdutos: Array<{ produto: string; quantidade: number; valor: number }>;
  bottomProdutos: Array<{ produto: string; quantidade: number; valor: number }>;
   vendasPorHora: Array<{ hora: number; valor: number; percentual: number }>;
   vendasPorDiaSemana: Array<{ dia: string; valor: number; percentual: number }>;
   vendasPorDia: Array<{ dia: string; valor: number; percentual: number }>;
   textoResumo: string;
}

export interface RelatorioEstoqueResult {
  itensLentos: Array<{ produto: string; categoria: string; giroMensal: number; diasUltimaVenda: number; quantidade: number }>;
  riscoRuptura: Array<{ produto: string; categoria: string; estoqueAtual: number; estoqueMinimo: number; diasAteRuptura: number }>;
  excessoEstoque: Array<{ produto: string; categoria: string; quantidade: number; valorEstimado: number; diasSemMovimento: number }>;
  sugestoesCompra: Array<{ produto: string; quantidadeSugerida: number; motivo: string }>;
  textoResumo: string;
}

export interface RelatorioRHResult {
  periodo: { inicio: string; fim: string };
  totalFuncionarios: number;
  absenteismo: { taxaMedia: number; tendencia: string; descricao: string };
  horasExtras: { totalHoras: number; custoTotal: number; mediaPorFuncionario: number };
  porDepartamento: Array<{ departamento: string; funcionarios: number; absenteismo: number; horasExtras: number; turnover: number }>;
  turnoverRate: number;
  textoResumo: string;
}

export interface ResumoExecutivoResult {
  periodo: { inicio: string; fim: string };
  kpis: Array<{ indicador: string; valor: string; variacao: string; status: 'positivo' | 'negativo' | 'neutro' }>;
  destaquesPositivos: string[];
  destaquesNegativos: string[];
  acoesPrioritarias: string[];
  textoCompleto: string;
}

@Injectable()
export class RelatoriosInteligentesService {
  private readonly logger = new Logger(RelatoriosInteligentesService.name);

  async gerarRelatorioVendas(periodo: { dataInicio: string; dataFim: string }, grupo?: GrupoRelatorio): Promise<RelatorioVendasResult> {
    this.logger.log(`Gerando relatório de vendas de ${periodo.dataInicio} a ${periodo.dataFim}, grupo: ${grupo || 'geral'}`);

    const produtos = [
      'Arroz 5kg', 'Feijão 1kg', 'Leite Integral 1L', 'Café Torrado 500g', 'Óleo de Soja 900ml',
      'Sabão em Pó 1kg', 'Cerveja Lata 350ml', 'Pão Francês', 'Carne Bovina kg', 'Frango Resfriado kg',
      'Açúcar Refinado 5kg', 'Farinha de Trigo 1kg', 'Macarrão Espaguete 500g', 'Biscoito Recheado', 'Refrigerante 2L',
      'Papel Higiênico 12un', 'Detergente Líquido 500ml', 'Shampoo 350ml', 'Margarina 500g', 'Iogurte Natural',
    ];

    const totalVendas = 2500000 + Math.random() * 500000;
    const totalItens = Math.floor(totalVendas / (35 + Math.random() * 20));
    const ticketMedio = totalVendas / totalItens;
    const crescimento = -5 + Math.random() * 15;

    const vendasProdutos = produtos.map(p => ({
      produto: p,
      quantidade: Math.floor(100 + Math.random() * 2000),
      valor: parseFloat((50 + Math.random() * 500).toFixed(2)),
    })).sort((a, b) => b.quantidade - a.quantidade);

    const vendasPorHora = Array.from({ length: 14 }, (_, i) => {
      const hora = i + 7;
      let valor = 50000 + Math.random() * 150000;
      if (hora >= 11 && hora <= 13) valor *= 1.4;
      if (hora >= 17 && hora <= 19) valor *= 1.6;
      return { hora, valor: parseFloat(valor.toFixed(2)), percentual: 0 };
    });
    const totalHora = vendasPorHora.reduce((a, b) => a + b.valor, 0);
    vendasPorHora.forEach(v => { v.percentual = parseFloat(((v.valor / totalHora) * 100).toFixed(1)); });

    const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const vendasPorDia = diasSemana.map((dia, i) => {
      let valor = 300000 + Math.random() * 100000;
      if (i === 0 || i === 6) valor *= 1.3;
      if (i === 1 || i === 2) valor *= 0.85;
      return { dia, valor: parseFloat(valor.toFixed(2)), percentual: 0 };
    });
    const totalDia = vendasPorDia.reduce((a, b) => a + b.valor, 0);
    vendasPorDia.forEach(v => { v.percentual = parseFloat(((v.valor / totalDia) * 100).toFixed(1)); });

    const top5 = vendasProdutos.slice(0, 5);
    const bottom5 = vendasProdutos.slice(-5);

    const textoResumo = `Relatório de vendas de ${periodo.dataInicio} a ${periodo.dataFim}: faturamento de R$ ${totalVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} com ${totalItens.toLocaleString('pt-BR')} itens vendidos. Ticket médio: R$ ${ticketMedio.toFixed(2)}. ${crescimento >= 0 ? `Crescimento de ${crescimento.toFixed(1)}% em relação ao período anterior.` : `Queda de ${Math.abs(crescimento).toFixed(1)}% em relação ao período anterior.`} Melhor produto: ${top5[0].produto} (${top5[0].quantidade} unidades).`;

    return {
      periodo: { inicio: periodo.dataInicio, fim: periodo.dataFim },
      totalVendas: parseFloat(totalVendas.toFixed(2)),
      totalItens,
      ticketMedio: parseFloat(ticketMedio.toFixed(2)),
      crescimentoPeriodoAnterior: parseFloat(crescimento.toFixed(1)),
      topProdutos: top5,
      bottomProdutos: bottom5,
      vendasPorHora,
      vendasPorDiaSemana: [],
      vendasPorDia,
      textoResumo,
    };
  }

  async gerarRelatorioEstoque(dto?: { categoria?: string }): Promise<RelatorioEstoqueResult> {
    this.logger.log('Gerando relatório de estoque inteligente');

    const itensBase = [
      { produto: 'Arroz Parboilizado 5kg', categoria: 'Alimentos', giroMensal: 0.3, diasUltimaVenda: 45, quantidade: 120 },
      { produto: 'Farinha de Trigo 1kg', categoria: 'Alimentos', giroMensal: 0.2, diasUltimaVenda: 60, quantidade: 85 },
      { produto: 'Molho de Tomate 340g', categoria: 'Alimentos', giroMensal: 0.5, diasUltimaVenda: 30, quantidade: 200 },
      { produto: 'Sardinha em Lata', categoria: 'Enlatados', giroMensal: 0.15, diasUltimaVenda: 90, quantidade: 300 },
      { produto: 'Milho em Lata', categoria: 'Enlatados', giroMensal: 0.25, diasUltimaVenda: 50, quantidade: 150 },
      { produto: 'Detergente 500ml', categoria: 'Limpeza', giroMensal: 0.1, diasUltimaVenda: 120, quantidade: 400 },
      { produto: 'Sabão em Barra', categoria: 'Limpeza', giroMensal: 0.12, diasUltimaVenda: 100, quantidade: 250 },
    ];

    const itensRuptura = [
      { produto: 'Leite Integral 1L', categoria: 'Laticínios', estoqueAtual: 50, estoqueMinimo: 200, diasAteRuptura: 2 },
      { produto: 'Pão de Forma', categoria: 'Padaria', estoqueAtual: 30, estoqueMinimo: 150, diasAteRuptura: 1 },
      { produto: 'Cerveja Lata 350ml', categoria: 'Bebidas', estoqueAtual: 200, estoqueMinimo: 500, diasAteRuptura: 3 },
      { produto: 'Papel Higiênico 12un', categoria: 'Limpeza', estoqueAtual: 80, estoqueMinimo: 300, diasAteRuptura: 2 },
      { produto: 'Café Torrado 500g', categoria: 'Alimentos', estoqueAtual: 40, estoqueMinimo: 120, diasAteRuptura: 1 },
    ];

    const excesso = [
      { produto: 'Panetone 500g', categoria: 'Sazonal', quantidade: 500, valorEstimado: 15000, diasSemMovimento: 180 },
      { produto: 'Sorvete 2L (Inverno)', categoria: 'Congelados', quantidade: 300, valorEstimado: 9000, diasSemMovimento: 90 },
      { produto: 'Protetor Solar FPS 30', categoria: 'Higiene', quantidade: 400, valorEstimado: 12000, diasSemMovimento: 120 },
      { produto: 'Espumante Nacional', categoria: 'Bebidas', quantidade: 200, valorEstimado: 8000, diasSemMovimento: 150 },
    ];

    const sugestoes = [
      { produto: 'Leite Integral 1L', quantidadeSugerida: 300, motivo: 'Ruptura iminente - estoque atual de 50 unidades' },
      { produto: 'Cerveja Lata 350ml', quantidadeSugerida: 500, motivo: 'Alta demanda sazonal prevista' },
      { produto: 'Pão de Forma', quantidadeSugerida: 200, motivo: 'Consumo diário elevado e estoque crítico' },
      { produto: 'Café Torrado 500g', quantidadeSugerida: 150, motivo: 'Estoque mínimo atingido' },
    ];

    const filtro = dto?.categoria;
    const itensLentos = itensBase.filter(i => !filtro || i.categoria === filtro);
    const riscoRuptura = itensRuptura.filter(i => !filtro || i.categoria === filtro);
    const excessoEstoque = excesso.filter(i => !filtro || i.categoria === filtro);

    return {
      itensLentos,
      riscoRuptura,
      excessoEstoque,
      sugestoesCompra: sugestoes,
      textoResumo: `Relatório de estoque: ${itensLentos.length} itens com baixo giro, ${riscoRuptura.length} em risco de ruptura (destaque para ${riscoRuptura[0]?.produto} com apenas ${riscoRuptura[0]?.diasAteRuptura} dias), ${excessoEstoque.length} itens com excesso (R$ ${excessoEstoque.reduce((a, b) => a + b.valorEstimado, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em produtos parados). ${sugestoes.length} sugestões de compra geradas.`,
    };
  }

  async gerarRelatorioRH(dto?: { departamento?: string }): Promise<RelatorioRHResult> {
    this.logger.log('Gerando relatório de RH inteligente');

    const totalFunc = 180 + Math.floor(Math.random() * 40);
    const taxaAbsenteismo = 3.5 + Math.random() * 4;
    const tendenciaAbs = Math.random() > 0.6 ? 'em alta' : 'estável';

    const horasExtras = {
      totalHoras: Math.floor(400 + Math.random() * 300),
      custoTotal: parseFloat((18000 + Math.random() * 12000).toFixed(2)),
      mediaPorFuncionario: 0,
    };
    horasExtras.mediaPorFuncionario = parseFloat((horasExtras.totalHoras / totalFunc).toFixed(1));

    const deps = [
      { departamento: 'Vendas', funcionarios: 45, absenteismo: 3.2, horasExtras: 85, turnover: 8 },
      { departamento: 'Operações', funcionarios: 60, absenteismo: 5.8, horasExtras: 120, turnover: 12 },
      { departamento: 'Administrativo', funcionarios: 25, absenteismo: 2.1, horasExtras: 30, turnover: 5 },
      { departamento: 'Logística', funcionarios: 30, absenteismo: 6.5, horasExtras: 95, turnover: 15 },
      { departamento: 'Marketing', funcionarios: 10, absenteismo: 1.8, horasExtras: 20, turnover: 10 },
      { departamento: 'TI', funcionarios: 15, absenteismo: 2.5, horasExtras: 40, turnover: 7 },
    ];

    const porDepartamento = deps
      .filter(d => !dto?.departamento || d.departamento === dto.departamento)
      .map(d => ({
        ...d,
        abseteismo: d.absenteismo + Math.random() * 2,
        horasExtras: Math.floor(d.horasExtras + Math.random() * 20),
        turnover: d.turnover + Math.random() * 5,
      }));

    const turnoverMedio = porDepartamento.reduce((a, b) => a + b.turnover, 0) / porDepartamento.length;

    return {
      periodo: { inicio: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 10), fim: new Date().toISOString().slice(0, 10) },
      totalFuncionarios: totalFunc,
      absenteismo: { taxaMedia: parseFloat(taxaAbsenteismo.toFixed(1)), tendencia: tendenciaAbs, descricao: `Taxa de absenteísmo de ${taxaAbsenteismo.toFixed(1)}%, ${tendenciaAbs} em relação ao mês anterior.` },
      horasExtras,
      porDepartamento,
      turnoverRate: parseFloat(turnoverMedio.toFixed(1)),
      textoResumo: `Relatório de RH: ${totalFunc} funcionários. Taxa de absenteísmo de ${taxaAbsenteismo.toFixed(1)}% (${tendenciaAbs}). Turnover médio de ${turnoverMedio.toFixed(1)}%. ${horasExtras.totalHoras}h extras no período (R$ ${horasExtras.custoTotal.toFixed(2)}). Departamento com maior absenteísmo: ${porDepartamento.reduce((a, b) => a.absenteismo > b.absenteismo ? a : b).departamento}.`,
    };
  }

  async gerarResumoExecutivo(periodo: { dataInicio: string; dataFim: string }): Promise<ResumoExecutivoResult> {
    this.logger.log(`Gerando resumo executivo de ${periodo.dataInicio} a ${periodo.dataFim}`);

    const faturamento = 2500000 + Math.random() * 500000;
    const margem = 22 + Math.random() * 6;
    const clientesAtendidos = Math.floor(15000 + Math.random() * 5000);

    const kpis = [
      { indicador: 'Faturamento', valor: `R$ ${faturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, variacao: `${(Math.random() * 12 - 3).toFixed(1)}%`, status: Math.random() > 0.3 ? 'positivo' as const : 'negativo' as const },
      { indicador: 'Margem Líquida', valor: `${margem.toFixed(1)}%`, variacao: `${(Math.random() * 3 - 1).toFixed(1)}pp`, status: margem > 24 ? 'positivo' as const : 'neutro' as const },
      { indicador: 'Ticket Médio', valor: `R$ ${(45 + Math.random() * 15).toFixed(2)}`, variacao: `${(Math.random() * 8 - 2).toFixed(1)}%`, status: Math.random() > 0.4 ? 'positivo' as const : 'negativo' as const },
      { indicador: 'Clientes Atendidos', valor: `${clientesAtendidos.toLocaleString('pt-BR')}`, variacao: `${(Math.random() * 10 - 2).toFixed(1)}%`, status: 'positivo' as const },
      { indicador: 'Inadimplência', valor: `${(3 + Math.random() * 4).toFixed(1)}%`, variacao: `${(Math.random() * 2 - 1).toFixed(1)}pp`, status: Math.random() > 0.7 ? 'negativo' as const : 'neutro' as const },
      { indicador: 'Satisfação', valor: `${(85 + Math.random() * 10).toFixed(0)}%`, variacao: `${(Math.random() * 5 - 1).toFixed(1)}pp`, status: 'positivo' as const },
    ];

    return {
      periodo: { inicio: periodo.dataInicio, fim: periodo.dataFim },
      kpis,
      destaquesPositivos: [
        `Faturamento de R$ ${faturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} no período`,
        `${clientesAtendidos.toLocaleString('pt-BR')} clientes atendidos`,
        'Indicador de satisfação acima da meta',
      ],
      destaquesNegativos: [
        kpis.find(k => k.status === 'negativo') ? `${kpis.find(k => k.status === 'negativo')?.indicador} com variação negativa de ${kpis.find(k => k.status === 'negativo')?.variacao}` : 'Nenhum indicador crítico no período',
        'Custos operacionais acima do orçado em algumas lojas',
        'Necessidade de reposição de estoque para itens de alto giro',
      ],
      acoesPrioritarias: [
        'Revisar contratos com fornecedores para redução de custos',
        'Intensificar campanha de recuperação de crédito',
        'Avaliar desempenho de lojas com margem abaixo da média',
        'Programar compras para reposição de estoques críticos',
      ],
      textoCompleto: `RESUMO EXECUTIVO - ${periodo.dataInicio} a ${periodo.dataFim}\n\nDESEMPENHO: Faturamento de R$ ${faturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} com margem líquida de ${margem.toFixed(1)}%. ${clientesAtendidos.toLocaleString('pt-BR')} clientes atendidos.\n\nDESTAQUES POSITIVOS: Satisfação dos clientes em alta; ticket médio estável.\n\nATENÇÃO: Custos operacionais requerem revisão; inadimplência sob monitoramento.\n\nPRÓXIMOS PASSOS: Revisar contratos de fornecedores, campanha de recuperação de crédito, reposição de estoque.`,
    };
  }

  gerarTextoRelatorio(dados: any, tipo: string): string {
    this.logger.log(`Gerando texto descritivo para relatório tipo ${tipo}`);

    const templates: Record<string, (d: any) => string> = {
      vendas: (d) => `Relatório de Vendas\n\nPeríodo: ${d.periodo?.inicio || 'N/I'} a ${d.periodo?.fim || 'N/I'}\nFaturamento Total: R$ ${(d.totalVendas || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\nItens Vendidos: ${(d.totalItens || 0).toLocaleString('pt-BR')}\nTicket Médio: R$ ${(d.ticketMedio || 0).toFixed(2)}\n\nDestaques:\n- Melhor horário de vendas: final da tarde\n- Dia mais forte: sábado\n- Produto mais vendido: ${d.topProdutos?.[0]?.produto || 'N/I'}`,
      estoque: (d) => `Relatório de Estoque\n\nItens com baixo giro: ${d.itensLentos?.length || 0}\nRisco de ruptura: ${d.riscoRuptura?.length || 0} itens\nExcesso de estoque: ${d.excessoEstoque?.length || 0} itens\n\nAtenção: ${d.riscoRuptura?.[0]?.produto || 'Nenhum'} precisa de reposição urgente.`,
      rh: (d) => `Relatório de Recursos Humanos\n\nTotal de Funcionários: ${d.totalFuncionarios || 'N/I'}\nAbsenteísmo: ${d.absenteismo?.taxaMedia || 'N/I'}%\nHoras Extras: ${d.horasExtras?.totalHoras || 0}h\nTurnover: ${d.turnoverRate || 'N/I'}%`,
      resumo: (d) => d.textoCompleto || 'Resumo executivo não disponível.',
    };

    return (templates[tipo] || ((d) => 'Tipo de relatório não reconhecido.'))(dados);
  }
}
