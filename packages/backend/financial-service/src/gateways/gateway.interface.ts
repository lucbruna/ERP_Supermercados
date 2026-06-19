export interface PaymentGateway {
  processPayment(data: PaymentData): Promise<PaymentResult>;
  cancelPayment(transactionId: string): Promise<CancelResult>;
  consultStatus(transactionId: string): Promise<StatusResult>;
}

export interface PaymentData {
  valor: number;
  parcelas?: number;
  cartaoInfo?: CartaoInfo;
  clienteInfo?: ClienteInfo;
  descricao?: string;
  tipoPagamento: 'CREDITO' | 'DEBITO' | 'PIX' | 'BOLETO';
}

export interface CartaoInfo {
  numero: string;
  mesVencimento: number;
  anoVencimento: number;
  codigoSeguranca: string;
  nomeTitular: string;
  bandeira: string;
}

export interface ClienteInfo {
  nome: string;
  documento: string;
  email?: string;
  telefone?: string;
  endereco?: Endereco;
}

export interface Endereco {
  cep: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
}

export interface PaymentResult {
  transactionId: string;
  status: string;
  codigoAutorizacao?: string;
  nsu?: string;
  mensagem: string;
}

export interface CancelResult {
  success: boolean;
  mensagem: string;
}

export interface StatusResult {
  status: string;
  valor: number;
  parcelas: number;
  data: string;
}
