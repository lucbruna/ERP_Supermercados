// ==================== COMPANY / TENANT ====================
export interface ICompany {
  id: string;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  inscricaoEstadual: string;
  inscricaoMunicipal: string;
  endereco: IEndereco;
  contato: IContato;
  regimeTributario: RegimeTributario;
  parametros: IParametrosEmpresa;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUnidade {
  id: string;
  companyId: string;
  tipo: TipoUnidade;
  cnpj: string;
  nome: string;
  endereco: IEndereco;
  contato: IContato;
  horarioFuncionamento: IHorarioFuncionamento;
  parametros: IParametrosUnidade;
  ativo: boolean;
}

export type TipoUnidade = 'LOJA' | 'CD' | 'ESCRITORIO' | 'DEPOSITO';

export type RegimeTributario = 'SIMPLES_NACIONAL' | 'LUCRO_PRESUMIDO' | 'LUCRO_REAL';

export interface IEndereco {
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  pais: string;
  latitude?: number;
  longitude?: number;
}

export interface IContato {
  telefone: string;
  celular: string;
  email: string;
  site?: string;
}

export interface IHorarioFuncionamento {
  segunda?: { abertura: string; fechamento: string };
  terca?: { abertura: string; fechamento: string };
  quarta?: { abertura: string; fechamento: string };
  quinta?: { abertura: string; fechamento: string };
  sexta?: { abertura: string; fechamento: string };
  sabado?: { abertura: string; fechamento: string };
  domingo?: { abertura: string; fechamento: string };
  feriado?: { abertura: string; fechamento: string };
}

export interface IParametrosEmpresa {
  toleranciaAtrasoMinutos: number;
  horasDiarias: number;
  horasSemanais: number;
  valeTransporte: boolean;
  valeRefeicao: boolean;
  vrDiario: number;
  vrPercentualDesconto: number;
  convenioMedico: boolean;
  convenioOdontologico: boolean;
};

export interface IParametrosUnidade {
  cnpj?: string;
  ie?: string;
  aliquotaISS: number;
  aliquotaICMS: number;
  permiteVendaFiado: boolean;
  limiteCrediario: number;
};

// ==================== USERS / AUTH ====================
export type PerfilAcesso =
  | 'ADMIN_MASTER'
  | 'DIRETORIA'
  | 'RH'
  | 'FINANCEIRO'
  | 'COMPRAS'
  | 'GERENTE_LOJA'
  | 'GERENTE_HORTIFRUTI'
  | 'GERENTE_ACOUGUE'
  | 'GERENTE_PADARIA'
  | 'GERENTE_CD'
  | 'CAIXA'
  | 'VENDEDOR'
  | 'ESTOQUISTA'
  | 'SEGURANCA'
  | 'CLIENTE'
  | 'FUNCIONARIO';

export type Departamento =
  | 'ADMINISTRACAO'
  | 'RH'
  | 'FINANCEIRO'
  | 'PDV'
  | 'ESTOQUE'
  | 'COMPRAS'
  | 'CRM'
  | 'MARKETING'
  | 'SEGURANCA'
  | 'MONITORAMENTO'
  | 'CD'
  | 'HORTIFRUTI'
  | 'ACOUGUE'
  | 'PADARIA'
  | 'FRIOS'
  | 'BEBIDAS'
  | 'LIMPEZA'
  | 'PERFUMARIA'
  | 'GERENCIA';

export interface IUser {
  id: string;
  companyId: string;
  unidadeId?: string;
  nome: string;
  cpf: string;
  rg?: string;
  email: string;
  celular: string;
  foto?: string;
  perfil: PerfilAcesso;
  departamento: Departamento;
  cargo: string;
  setor?: string;
  ativo: boolean;
  mfaAtivado: boolean;
  mfaTipo?: MFATipo;
  ultimoAcesso?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type MFATipo = 'FACE_ID' | 'BIOMETRIA' | 'TOTP' | 'SMS' | 'EMAIL';

export interface IPermission {
  id: string;
  perfil: PerfilAcesso;
  departamento: Departamento;
  recurso: string;
  acao: PermissaoAcao;
}

export type PermissaoAcao = 'CRIAR' | 'LER' | 'ATUALIZAR' | 'EXCLUIR' | 'APROVAR' | 'TODOS';

// ==================== RH ====================
export interface IFuncionario {
  id: string;
  companyId: string;
  unidadeId: string;
  user: IUser;
  matricula: string;
  dataAdmissao: Date;
  dataDemissao?: Date;
  salario: number;
  cargo: string;
  departamento: Departamento;
  setor: string;
  jornadaTrabalho: IJornadaTrabalho;
  dadosBancarios: IDadosBancarios;
  documentos: IDocumentosFuncionario;
  dependentes: IDependente[];
  beneficio: IBeneficio[];
  fgts: IFGTS;
  pisPasep: IPISPasep;
  status: StatusFuncionario;
}

export type StatusFuncionario = 'ATIVO' | 'FERIAS' | 'AFASTADO' | 'DEMITIDO' | 'DECESSO';

export interface IJornadaTrabalho {
  tipo: 'FIXA' | 'ESCALA' | 'LIBERAL';
  entrada: string;
  saida: string;
  intervaloInicio: string;
  intervaloFim: string;
  diasSemana: number[];
}

export interface IDadosBancarios {
  banco: string;
  agencia: string;
  conta: string;
  digito: string;
  tipo: 'CORRENTE' | 'POUPANCA' | 'SALARIO';
  pix?: string;
}

export interface IDocumentosFuncionario {
  cpf: string;
  rg: string;
  cnh?: string;
  tituloEleitor?: string;
  carteiraTrabalho: string;
  serieCTPS: string;
  pisPasep: string;
  reservista?: string;
}

export interface IDependente {
  nome: string;
  cpf: string;
  dataNascimento: Date;
  parentesco: string;
  ir?: boolean;
  salarioFamilia?: boolean;
}

export interface IBeneficio {
  tipo: 'VT' | 'VR' | 'VA' | 'CONVENIO_MEDICO' | 'CONVENIO_ODONTO' | 'SEGURO_VIDA' | 'PLR' | 'BOLSA_ESTUDO';
  valor: number;
  descontoMensal: number;
  ativo: boolean;
}

export interface IFGTS {
  opcao: 'REGIME_CEF' | 'ANIVERSARIO';
  saldo: number;
  mesCompetencia: Date;
}

export interface IPISPasep {
  numero: string;
  dataCadastro: Date;
}

// ==================== PONTO ====================
export interface IRegistroPonto {
  id: string;
  funcionarioId: string;
  unidadeId: string;
  tipo: TipoRegistroPonto;
  dataHora: Date;
  latitude?: number;
  longitude?: number;
  fotoUrl?: string;
  biometriaHash?: string;
  faceMatch?: number;
  origem: 'FACE_ID' | 'BIOMETRIA' | 'MANUAL' | 'RELÓGIO';
  ip?: string;
  dispositivoId?: string;
  observacao?: string;
  validado: boolean;
  validadoPor?: string;
}

export type TipoRegistroPonto = 'ENTRADA' | 'SAIDA' | 'INTERVALO_INICIO' | 'INTERVALO_FIM' | 'HORA_EXTRA_INICIO' | 'HORA_EXTRA_FIM';

export interface IEspelhoPonto {
  id: string;
  funcionarioId: string;
  mes: number;
  ano: number;
  dias: IDiaPonto[];
  totalHorasPrevistas: number;
  totalHorasTrabalhadas: number;
  totalHorasExtras: number;
  totalAtrasos: number;
  saldoBancoHoras: number;
  status: StatusEspelho;
}

export interface IDiaPonto {
  data: Date;
  diaSemana: number;
  previsto: { entrada: string; saida: string; intervalo: string };
  registros: IRegistroPonto[];
  horasTrabalhadas: number;
  horasExtras: number;
  atrasoMinutos: number;
  falta: boolean;
  abono?: boolean;
  justificativa?: string;
}

export type StatusEspelho = 'ABERTO' | 'FECHADO' | 'VALIDADO' | 'REJEITADO';

export interface IFolhaPagamento {
  id: string;
  funcionarioId: string;
  companyId: string;
  mes: number;
  ano: number;
  salarioBase: number;
  proventos: IProvento[];
  descontos: IDesconto[];
  salarioBruto: number;
  salarioLiquido: number;
  fgts: number;
  inss: number;
  irrf: number;
  dataPagamento?: Date;
  status: StatusFolha;
  holeriteUrl?: string;
}

export interface IProvento {
  codigo: string;
  descricao: string;
  tipo: 'SALARIO' | 'HORA_EXTRA' | 'COMISSAO' | 'PLR' | 'BONUS' | 'FERIAS' | 'DECIMO_TERCEIRO' | 'OUTROS';
  referencia: string;
  valor: number;
}

export interface IDesconto {
  codigo: string;
  descricao: string;
  tipo: 'INSS' | 'IRRF' | 'VT' | 'VR' | 'VA' | 'CONVENIO_MEDICO' | 'PENSÃO' | 'FGTS' | 'OUTROS';
  referencia: string;
  valor: number;
}

export type StatusFolha = 'CALCULADA' | 'FECHADA' | 'PAGA' | 'CANCELADA';

// ==================== FINANCEIRO ====================
export interface IContaPagar {
  id: string;
  companyId: string;
  unidadeId: string;
  fornecedorId: string;
  documento: string;
  parcela: number;
  emitente: string;
  descricao: string;
  valorNominal: number;
  valorPago?: number;
  dataEmissao: Date;
  dataVencimento: Date;
  dataPagamento?: Date;
  juros?: number;
  multa?: number;
  desconto?: number;
  categoria: string;
  centroCusto: string;
  formaPagamento: FormaPagamento;
  status: StatusConta;
  observacao?: string;
  anexos: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IContaReceber {
  id: string;
  companyId: string;
  unidadeId: string;
  clienteId: string;
  vendaId?: string;
  documento: string;
  parcela: number;
  descricao: string;
  valorNominal: number;
  valorRecebido?: number;
  dataEmissao: Date;
  dataVencimento: Date;
  dataRecebimento?: Date;
  juros?: number;
  multa?: number;
  desconto?: number;
  categoria: string;
  formaPagamento: FormaPagamento;
  status: StatusConta;
  observacao?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILancamentoCaixa {
  id: string;
  companyId: string;
  unidadeId: string;
  pdvId?: string;
  tipo: 'ENTRADA' | 'SAIDA';
  categoria: string;
  descricao: string;
  valor: number;
  formaPagamento: FormaPagamento;
  dataHora: Date;
  operadorId: string;
  origem: string;
  observacao?: string;
  conciliado: boolean;
  dataConciliacao?: Date;
}

export interface IConciliaçãoBancaria {
  id: string;
  companyId: string;
  contaBancariaId: string;
  mes: number;
  ano: number;
  saldoInicial: number;
  saldoFinal: number;
  lancamentosConciliados: number;
  lancamentosPendentes: number;
  diferencas: number;
  status: 'ABERTA' | 'EM_ANDAMENTO' | 'CONCILIADA';
  createdAt: Date;
  updatedAt: Date;
}

export interface IContaBancaria {
  id: string;
  companyId: string;
  banco: string;
  codigoBanco: string;
  agencia: string;
  conta: string;
  digito: string;
  tipo: 'CORRENTE' | 'POUPANCA' | 'SALARIO' | 'INVESTIMENTO';
  pix: string[];
  saldoAtual: number;
  saldoDisponivel: number;
  limiteChequeEspecial: number;
  ativo: boolean;
}

export type FormaPagamento =
  | 'DINHEIRO'
  | 'CARTAO_CREDITO'
  | 'CARTAO_DEBITO'
  | 'PIX'
  | 'BOLETO'
  | 'CHEQUE'
  | 'VALE_ALIMENTACAO'
  | 'VALE_REFEICAO'
  | 'CONVENIO'
  | 'CREDIARIO'
  | 'TRANSFERENCIA'
  | 'DEPOSITO';

export type StatusConta = 'PENDENTE' | 'VENCIDA' | 'PAGA' | 'CANCELADA' | 'RENEGOCIADA';

// ==================== PDV ====================
export interface IVenda {
  id: string;
  companyId: string;
  unidadeId: string;
  pdvId: string;
  numero: string;
  clienteId?: string;
  itens: IItemVenda[];
  pagamentos: IPagamentoVenda[];
  subtotal: number;
  desconto: number;
  acrescimo: number;
  total: number;
  troco?: number;
  tipo: TipoVenda;
  status: StatusVenda;
  operadorId: string;
  dataHora: Date;
  nfce?: string;
  sat?: string;
  cancelada: boolean;
  motivoCancelamento?: string;
  createdAt: Date;
}

export interface IItemVenda {
  id: string;
  produtoId: string;
  codigoBarras: string;
  descricao: string;
  quantidade: number;
  unidade: 'UN' | 'KG' | 'L' | 'PC';
  precoUnitario: number;
  precoTotal: number;
  desconto: number;
  acrescimo: number;
  peso?: number;
  lote?: string;
  validade?: Date;
  setor: string;
  estoqueAbatido: boolean;
}

export interface IPagamentoVenda {
  id: string;
  tipo: FormaPagamento;
  valor: number;
  parcelas: number;
  bandeira?: string;
  codigoAutorizacao?: string;
  nsu?: string;
  pixCopiaCola?: string;
  chavePix?: string;
  idTransacao?: string;
  trocoPara?: number;
  troco?: number;
}

export type TipoVenda = 'PDV' | 'PRE_VENDA' | 'VENDA_ONLINE' | 'CREDIARIO' | 'CONVENIO';

export type StatusVenda = 'EM_ANDAMENTO' | 'FINALIZADA' | 'CANCELADA' | 'TROCA';

export interface IPDV {
  id: string;
  companyId: string;
  unidadeId: string;
  codigo: string;
  nome: string;
  tipo: 'FIXO' | 'MOVEL' | 'AUTOATENDIMENTO';
  ip?: string;
  mac?: string;
  status: StatusPDV;
  operadorId?: string;
  ultimaAbertura?: Date;
  ultimoFechamento?: Date;
  saldoAbertura?: number;
  saldoFechamento?: number;
  createdAt: Date;
}

export type StatusPDV = 'LIVRE' | 'OCUPADO' | 'FECHADO' | 'MANUTENCAO';

// ==================== ESTOQUE ====================
export interface IProduto {
  id: string;
  companyId: string;
  unidadeId: string;
  codigo: string;
  codigoBarras: string;
  codigoBarrasSecundario?: string;
  descricao: string;
  descricaoReduzida?: string;
  categoria: ICategoriaProduto;
  marca: string;
  fabricante?: string;
  unidadeMedida: 'UN' | 'KG' | 'L' | 'PC' | 'CX' | 'DUZIA' | 'PACOTE';
  ncm: string;
  cest?: string;
  cfop: string;
  origem: OrigemProduto;
  icms?: number;
  ipi?: number;
  pis?: number;
  cofins?: number;
  precoCusto: number;
  precoVenda: number;
  precoPromocional?: number;
  lucroPercentual: number;
  estoqueMinimo: number;
  estoqueMaximo: number;
  estoqueAtual: number;
  estoqueReservado: number;
  fracionado: boolean;
  pesavel: boolean;
  validadeDias?: number;
  loteControlado: boolean;
  ativo: boolean;
  imagemUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategoriaProduto {
  id: string;
  companyId: string;
  nome: string;
  departamento: Departamento;
  percentualMargem: number;
  ativo: boolean;
}

export type OrigemProduto = '0-NACIONAL' | '1-IMPORTADO' | '2-ESTRANGEIRO';

export interface IInventario {
  id: string;
  companyId: string;
  unidadeId: string;
  tipo: 'COMPLETO' | 'PARCIAL' | 'ROTATIVO' | 'SETOR';
  setor?: string;
  dataInicio: Date;
  dataFim?: Date;
  itens: IItemInventario[];
  status: StatusInventario;
  responsavelId: string;
  aprovadoPor?: string;
  observacao?: string;
  divergencias: number;
}

export interface IItemInventario {
  produtoId: string;
  codigoBarras: string;
  descricao: string;
  estoqueTeorico: number;
  estoqueReal: number;
  divergencia: number;
  valorDivergencia: number;
  lote?: string;
  validade?: Date;
  contagem: number;
  ajustado: boolean;
}

export type StatusInventario = 'ABERTO' | 'EM_ANDAMENTO' | 'FECHADO' | 'AJUSTADO';

export interface ITransferenciaEstoque {
  id: string;
  companyId: string;
  origemUnidadeId: string;
  destinoUnidadeId: string;
  itens: IItemTransferencia[];
  dataCriacao: Date;
  dataExpedicao?: Date;
  dataRecebimento?: Date;
  status: StatusTransferencia;
  responsavelOrigemId: string;
  responsavelDestinoId?: string;
  observacao?: string;
}

export interface IItemTransferencia {
  produtoId: string;
  quantidade: number;
  lote?: string;
  validade?: Date;
  conferidoOrigem: boolean;
  conferidoDestino: boolean;
}

export type StatusTransferencia = 'PENDENTE' | 'EXPEDIDA' | 'EM_TRANSITO' | 'RECEBIDA' | 'CANCELADA';

// ==================== COMPRAS ====================
export interface ICotacao {
  id: string;
  companyId: string;
  unidadeId: string;
  itens: IItemCotacao[];
  fornecedores: IFornecedorCotacao[];
  dataAbertura: Date;
  dataFechamento: Date;
  status: StatusCotacao;
  aprovadoPor?: string;
  createdAt: Date;
}

export interface IItemCotacao {
  produtoId: string;
  quantidade: number;
  prazoEntregaDias: number;
}

export interface IFornecedorCotacao {
  fornecedorId: string;
  preco: number;
  prazoEntrega: number;
  condicaoPagamento: string;
  vencedor: boolean;
}

export type StatusCotacao = 'ABERTA' | 'FECHADA' | 'APROVADA' | 'CANCELADA';

export interface IPedidoCompra {
  id: string;
  companyId: string;
  unidadeId: string;
  fornecedorId: string;
  cotacaoId?: string;
  numero: string;
  itens: IItemPedidoCompra[];
  dataPedido: Date;
  dataEntregaPrevista: Date;
  dataEntregaReal?: Date;
  valorTotal: number;
  frete: number;
  desconto: number;
  condicaoPagamento: string;
  status: StatusPedidoCompra;
  aprovacaoHierarquica: IAprovacaoHierarquica[];
  recebimento?: IRecebimentoMercadoria;
  createdAt: Date;
}

export interface IItemPedidoCompra {
  produtoId: string;
  quantidade: number;
  quantidadeRecebida: number;
  precoUnitario: number;
  precoTotal: number;
  lote?: string;
  validade?: Date;
}

export type StatusPedidoCompra =
  | 'RASCUNHO'
  | 'AGUARDANDO_APROVACAO'
  | 'APROVADO'
  | 'ENVIADO'
  | 'PARCIAL'
  | 'RECEBIDO'
  | 'CANCELADO';

export interface IAprovacaoHierarquica {
  aprovadorId: string;
  nivel: number;
  status: 'PENDENTE' | 'APROVADO' | 'REJEITADO';
  data?: Date;
  observacao?: string;
}

export interface IRecebimentoMercadoria {
  data: Date;
  conferenteId: string;
  itens: IItemRecebimento[];
  notaFiscal: INotaFiscal;
  avarias: number;
  divergencias: number;
  observacao?: string;
}

export interface IItemRecebimento {
  produtoId: string;
  quantidadePedida: number;
  quantidadeRecebida: number;
  quantidadeAvariada: number;
  lote: string;
  validade: Date;
  conferido: boolean;
}

export interface INotaFiscal {
  numero: string;
  serie: string;
  chaveAcesso: string;
  cfop: string;
  valorTotal: number;
  valorICMS: number;
  valorIPI: number;
  dataEmissao: Date;
  xmlUrl: string;
  danfeUrl: string;
}

// ==================== CRM ====================
export interface ICliente {
  id: string;
  companyId: string;
  nome: string;
  cpfCnpj: string;
  rg?: string;
  email: string;
  celular: string;
  telefone?: string;
  dataNascimento?: Date;
  genero?: string;
  endereco: IEndereco;
  senha: string;
  pontos: number;
  cashbackDisponivel: number;
  cashbackRecebido: number;
  totalCompras: number;
  ultimaCompra?: Date;
  dataCadastro: Date;
  segmento: SegmentoCliente;
  preferencias: string[];
  observacao?: string;
  ativo: boolean;
  createdAt: Date;
}

export type SegmentoCliente =
  | 'POTENCIAL'
  | 'REGULAR'
  | 'FREQUENTE'
  | 'VIP'
  | 'INATIVO'
  | 'PERDIDO';

export interface IFidelidadePrograma {
  id: string;
  companyId: string;
  nome: string;
  tipo: 'PONTOS' | 'CASHBACK' | 'CLUBE_VANTAGENS' | 'ASSINATURA';
  regras: IRegraFidelidade[];
  ativo: boolean;
  createdAt: Date;
}

export interface IRegraFidelidade {
  valorMinimo: number;
  pontos: number;
  multiplicador: number;
  cashbackPercentual: number;
  categoria?: string;
}

export interface ICupom {
  id: string;
  companyId: string;
  codigo: string;
  tipo: 'PERCENTUAL' | 'VALOR_FIXO' | 'FRETE_GRATIS' | 'COMPRE_LEVE';
  valor: number;
  valorMinimo?: number;
  clienteId?: string;
  dataInicio: Date;
  dataFim: Date;
  usoLimite: number;
  usoAtual: number;
  ativo: boolean;
  createdAt: Date;
}

export interface ICashbackTransacao {
  id: string;
  clienteId: string;
  vendaId?: string;
  tipo: 'CREDITO' | 'DEBITO' | 'ESTORNO';
  valor: number;
  saldoAnterior: number;
  saldoAtual: number;
  descricao: string;
  data: Date;
}

// ==================== MARKETING ====================
export interface ICampanha {
  id: string;
  companyId: string;
  nome: string;
  tipo: CanalMarketing;
  segmento: SegmentoCliente[];
  mensagem: string;
  agendamento?: Date;
  enviada: boolean;
  dataEnvio?: Date;
  totalEnviados: number;
  totalAbertos: number;
  totalCliques: number;
  conversao: number;
  createdAt: Date;
}

export type CanalMarketing = 'SMS' | 'WHATSAPP' | 'EMAIL' | 'PUSH_NOTIFICATION';

// ==================== SEGURANCA ====================
export interface IAuditLog {
  id: string;
  companyId: string;
  usuarioId: string;
  usuarioNome: string;
  acao: string;
  recurso: string;
  recursoId?: string;
  detalhes: string;
  ip: string;
  userAgent: string;
  gravidade: 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA';
  dataHora: Date;
  metadata?: Record<string, unknown>;
}

export interface ISessao {
  id: string;
  usuarioId: string;
  token: string;
  refreshToken: string;
  ip: string;
  dispositivo: string;
  userAgent: string;
  mfaValidado: boolean;
  dataInicio: Date;
  dataExpiracao: Date;
  dataFim?: Date;
  ativo: boolean;
}

// ==================== MONITORAMENTO / CFTV ====================
export interface ICamera {
  id: string;
  companyId: string;
  unidadeId: string;
  nome: string;
  ip: string;
  porta: number;
  tipo: 'IP' | 'DVR' | 'NVR' | 'ANALOGICA';
  protocolo: 'RTSP' | 'ONVIF' | 'HTTP' | 'HIKVISION' | 'DAHUA';
  resolucao: string;
  localizacao: string;
  status: 'ONLINE' | 'OFFLINE' | 'MANUTENCAO';
  urlStream: string;
  urlSnapshot: string;
  hasAI: boolean;
  deteccoes: IDeteccaoConfig[];
  createdAt: Date;
}

export interface IDeteccaoConfig {
  tipo: 'ROUBO' | 'MOVIMENTO_SUSPEITO' | 'AGLOMERACAO' | 'QUEDA' | 'PERMANENCIA' | 'PLACA' | 'FACIAL';
  sensibilidade: number;
  zona?: IPolygon;
  ativo: boolean;
}

export interface IPolygon {
  points: { x: number; y: number }[];
}

export interface IEventoCamera {
  id: string;
  cameraId: string;
  tipo: string;
  confianca: number;
  snapshotUrl: string;
  videoUrl?: string;
  dataHora: Date;
  processado: boolean;
  alertaEnviado: boolean;
  metadata: Record<string, unknown>;
}

// ==================== CD / LOGISTICA ====================
export interface ISeparacaoPedido {
  id: string;
  companyId: string;
  pedidoId: string;
  tipo: 'TRANSFERENCIA' | 'VENDA_CD' | 'VENDA_ONLINE';
  itens: IItemSeparacao[];
  status: StatusSeparacao;
  separadorId: string;
  conferenteId?: string;
  dataInicio: Date;
  dataFim?: Date;
  prioridade: 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE';
  observacao?: string;
}

export interface IItemSeparacao {
  produtoId: string;
  quantidadeSolicitada: number;
  quantidadeSeparada: number;
  quantidadeConferida: number;
  lote: string;
  validade: Date;
  posicao: string;
  conferido: boolean;
}

export type StatusSeparacao = 'PENDENTE' | 'EM_SEPARACAO' | 'SEPARADO' | 'EM_CONFERENCIA' | 'CONFERIDO' | 'EXPEDIDO';

export interface IRoteirizacao {
  id: string;
  companyId: string;
  origemUnidadeId: string;
  destinoUnidadeId: string;
  entregas: IEntregaRota[];
  distanciaKm: number;
  tempoEstimado: string;
  custoFrete: number;
  motoristaId: string;
  veiculoId: string;
  dataSaida: Date;
  dataPrevisao: Date;
  dataChegada?: Date;
  status: StatusRota;
}

export interface IEntregaRota {
  pedidoId: string;
  sequencia: number;
  endereco: IEndereco;
  contato: IContato;
  status: 'PENDENTE' | 'EM_ROTA' | 'ENTREGUE' | 'NAO_ENTREGUE';
  dataEntrega?: Date;
  assinaturaUrl?: string;
  fotoUrl?: string;
  observacao?: string;
}

export type StatusRota = 'PLANEJADA' | 'EM_ROTA' | 'FINALIZADA' | 'CANCELADA';

// ==================== BI / DASHBOARD ====================
export interface IDashboardKPI {
  id: string;
  companyId: string;
  unidadeId?: string;
  nome: string;
  categoria: 'VENDAS' | 'FINANCEIRO' | 'ESTOQUE' | 'RH' | 'OPERACIONAL';
  valor: number;
  meta: number;
  variacao: number;
  periodo: Date;
  tipo: 'REAL_TIME' | 'DIARIO' | 'SEMANAL' | 'MENSAL' | 'ANUAL';
}

export interface IRelatorioBI {
  id: string;
  companyId: string;
  nome: string;
  tipo: string;
  parametros: Record<string, unknown>;
  dados: Record<string, unknown>[];
  criadoPor: string;
  dataCriacao: Date;
  agendado: boolean;
  frequencia?: 'DIARIO' | 'SEMANAL' | 'MENSAL';
  ultimaExecucao?: Date;
}

// ==================== IA ====================
export interface IPrevisaoVenda {
  produtoId: string;
  data: Date;
  quantidadePrevista: number;
  confianca: number;
  fatores: string[];
}

export interface IRecomendacao {
  tipo: 'COMPRA' | 'PROMOCAO' | 'PRECO' | 'ESTOQUE';
  produtoId: string;
  acao: string;
  prioridade: 'BAIXA' | 'MEDIA' | 'ALTA';
  motivo: string;
  data: Date;
}
