import { IsString, IsNumber, IsDateString, IsOptional, IsArray, IsEnum, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StatusConta } from '@prisma/client';

export class CreateContaPagarDto {
  @ApiProperty()
  @IsString()
  companyId: string;

  @ApiProperty()
  @IsString()
  unidadeId: string;

  @ApiProperty()
  @IsString()
  fornecedorId: string;

  @ApiProperty({ example: 'NF-2024-0001' })
  @IsString()
  documento: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  parcela?: number;

  @ApiProperty({ example: 'Distribuidora ABC Ltda' })
  @IsString()
  emitente: string;

  @ApiProperty({ example: 'Compra de mercadorias - lote 123' })
  @IsString()
  descricao: string;

  @ApiProperty()
  @IsNumber()
  valorNominal: number;

  @ApiProperty()
  @IsDateString()
  dataEmissao: string;

  @ApiProperty()
  @IsDateString()
  dataVencimento: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dataPagamento?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  juros?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  multa?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  desconto?: number;

  @ApiProperty({ example: 'MERCADORIAS' })
  @IsString()
  categoria: string;

  @ApiProperty({ example: 'COMPRAS' })
  @IsString()
  centroCusto: string;

  @ApiProperty({ example: 'BOLETO' })
  @IsString()
  formaPagamento: string;

  @ApiPropertyOptional({ enum: StatusConta, default: 'PENDENTE' })
  @IsOptional()
  @IsEnum(StatusConta)
  status?: StatusConta;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observacao?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  anexos?: string[];
}

export class UpdateContaPagarDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  unidadeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  documento?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  parcela?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  emitente?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  valorNominal?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  valorPago?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dataEmissao?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dataVencimento?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dataPagamento?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  juros?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  multa?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  desconto?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoria?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  centroCusto?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  formaPagamento?: string;

  @ApiPropertyOptional({ enum: StatusConta })
  @IsOptional()
  @IsEnum(StatusConta)
  status?: StatusConta;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observacao?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  anexos?: string[];
}

export class QueryContaPagarDto {
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
  fornecedorId?: string;

  @ApiPropertyOptional({ enum: StatusConta })
  @IsOptional()
  @IsEnum(StatusConta)
  status?: StatusConta;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dataVencimentoInicio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dataVencimentoFim?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoria?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  centroCusto?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  pagina?: number;

  @ApiPropertyOptional({ default: 50 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  limite?: number;
}

export class BaixaContaPagarDto {
  @ApiProperty()
  @IsNumber()
  valorPago: number;

  @ApiProperty()
  @IsDateString()
  dataPagamento: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  juros?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  multa?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  desconto?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observacao?: string;
}
