import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsArray,
  IsBoolean,
  Min,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum VendaTipo {
  PDV = 'PDV',
  PRE_VENDA = 'PRE_VENDA',
  VENDA_ONLINE = 'VENDA_ONLINE',
  CREDIARIO = 'CREDIARIO',
  CONVENIO = 'CONVENIO',
  MESA = 'MESA',
  DELIVERY = 'DELIVERY',
}

export enum VendaStatus {
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  FINALIZADA = 'FINALIZADA',
  CANCELADA = 'CANCELADA',
  TROCA = 'TROCA',
}

export enum UnidadeMedida {
  UN = 'UN',
  KG = 'KG',
  L = 'L',
  PC = 'PC',
}

export class ItemVendaDto {
  @ApiProperty({ example: 'uuid-produto' })
  @IsString()
  produtoId: string;

  @ApiPropertyOptional({ example: '7891234567890' })
  @IsOptional()
  @IsString()
  codigoBarras?: string;

  @ApiProperty({ example: 'Arroz Branco 5kg' })
  @IsString()
  descricao: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(0.001)
  quantidade: number;

  @ApiProperty({ enum: UnidadeMedida, default: UnidadeMedida.UN })
  @IsEnum(UnidadeMedida)
  @IsOptional()
  unidade?: UnidadeMedida;

  @ApiProperty({ example: 25.90 })
  @IsNumber()
  @Min(0)
  precoUnitario: number;

  @ApiProperty({ example: 51.80 })
  @IsNumber()
  @Min(0)
  precoTotal: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  desconto?: number;

  @ApiPropertyOptional({ example: 2.500 })
  @IsOptional()
  @IsNumber()
  peso?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lote?: string;

  @ApiPropertyOptional()
  @IsOptional()
  validade?: Date;

  @ApiProperty({ example: 'MERCEARIA' })
  @IsString()
  setor: string;
}

export class PagamentoVendaDto {
  @ApiProperty({ enum: ['DINHEIRO', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'PIX', 'VALE_ALIMENTACAO', 'VALE_REFEICAO', 'CONVENIO', 'CREDIARIO'] })
  @IsString()
  tipo: string;

  @ApiProperty({ example: 100.00 })
  @IsNumber()
  @Min(0)
  valor: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  parcelas?: number;

  @ApiPropertyOptional({ example: 'VISA' })
  @IsOptional()
  @IsString()
  bandeira?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  codigoAutorizacao?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nsu?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pixCopiaCola?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  chavePix?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  idTransacao?: string;

  @ApiPropertyOptional({ example: 100.00 })
  @IsOptional()
  @IsNumber()
  trocoPara?: number;

  @ApiPropertyOptional({ example: 0.00 })
  @IsOptional()
  @IsNumber()
  troco?: number;
}

export class CreateVendaDto {
  @ApiProperty({ example: 'uuid-company' })
  @IsString()
  companyId: string;

  @ApiProperty({ example: 'uuid-unidade' })
  @IsString()
  unidadeId: string;

  @ApiProperty({ example: 'uuid-pdv' })
  @IsString()
  pdvId: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  numero: number;

  @ApiPropertyOptional({ example: 'uuid-cliente' })
  @IsOptional()
  @IsString()
  clienteId?: string;

  @ApiProperty({ type: [ItemVendaDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ItemVendaDto)
  itens: ItemVendaDto[];

  @ApiProperty({ type: [PagamentoVendaDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PagamentoVendaDto)
  pagamentos: PagamentoVendaDto[];

  @ApiProperty({ example: 100.00 })
  @IsNumber()
  @Min(0)
  subtotal: number;

  @ApiPropertyOptional({ example: 5.00 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  desconto?: number;

  @ApiPropertyOptional({ example: 0.00 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  acrescimo?: number;

  @ApiProperty({ example: 95.00 })
  @IsNumber()
  @Min(0)
  total: number;

  @ApiPropertyOptional({ example: 0.00 })
  @IsOptional()
  @IsNumber()
  troco?: number;

  @ApiProperty({ enum: VendaTipo, default: VendaTipo.PDV })
  @IsEnum(VendaTipo)
  @IsOptional()
  tipo?: VendaTipo;

  @ApiProperty()
  @IsString()
  operadorId: string;
}

export class FinalizarVendaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nfce?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sat?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  gerarNfce?: boolean;
}

export class CancelarVendaDto {
  @ApiProperty()
  @IsString()
  motivoCancelamento: string;

  @ApiProperty()
  @IsString()
  operadorId: string;
}

export class VendaQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companyId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  unidadeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pdvId?: string;

  @ApiPropertyOptional({ enum: VendaStatus })
  @IsOptional()
  @IsEnum(VendaStatus)
  status?: VendaStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clienteId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  dataInicio?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  dataFim?: Date;
}
