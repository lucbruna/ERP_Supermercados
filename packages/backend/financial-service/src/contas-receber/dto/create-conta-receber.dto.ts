import { IsString, IsNumber, IsDateString, IsOptional, IsArray, IsEnum, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StatusConta } from '@prisma/client';

export class CreateContaReceberDto {
  @ApiProperty()
  @IsString()
  companyId: string;

  @ApiProperty()
  @IsString()
  unidadeId: string;

  @ApiProperty()
  @IsString()
  clienteId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vendaId?: string;

  @ApiProperty({ example: 'NF-2024-0001' })
  @IsString()
  documento: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  parcela?: number;

  @ApiProperty({ example: 'João Silva' })
  @IsString()
  emitente: string;

  @ApiProperty({ example: 'Venda de mercadorias' })
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
  dataRecebimento?: string;

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

  @ApiProperty({ example: 'VENDAS' })
  @IsString()
  categoria: string;

  @ApiProperty({ example: 'FATURAMENTO' })
  @IsString()
  centroCusto: string;

  @ApiProperty({ example: 'CARTAO_CREDITO' })
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

export class UpdateContaReceberDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  unidadeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clienteId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vendaId?: string;

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
  valorRecebido?: number;

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
  dataRecebimento?: string;

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

export class QueryContaReceberDto {
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
  clienteId?: string;

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

export class ReceberContaDto {
  @ApiProperty()
  @IsNumber()
  valorRecebido: number;

  @ApiProperty()
  @IsDateString()
  dataRecebimento: string;

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
