export enum GatewayTipo {
  MERCADO_PAGO = 'MERCADO_PAGO',
  PAGSEGURO = 'PAGSEGURO',
  STONE = 'STONE',
  CIELO = 'CIELO',
  REDE = 'REDE',
  GETNET = 'GETNET',
}

export enum GatewayTransacaoStatus {
  PENDENTE = 'PENDENTE',
  APROVADO = 'APROVADO',
  RECUSADO = 'RECUSADO',
  CANCELADO = 'CANCELADO',
  ESTORNADO = 'ESTORNADO',
  FALHOU = 'FALHOU',
}

export interface GatewayConfig {
  configured: boolean;
  nome: string;
  tipo: GatewayTipo;
}
