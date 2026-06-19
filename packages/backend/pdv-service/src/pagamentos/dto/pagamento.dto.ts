import { IsString, IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PagamentoTipo {
  DINHEIRO = 'DINHEIRO',
  CARTAO_CREDITO = 'CARTAO_CREDITO',
  CARTAO_DEBITO = 'CARTAO_DEBITO',
  PIX = 'PIX',
  VALE_ALIMENTACAO = 'VALE_ALIMENTACAO',
  VALE_REFEICAO = 'VALE_REFEICAO',
  CONVENIO = 'CONVENIO',
  CREDIARIO = 'CREDIARIO',
}

export class ProcessarPagamentoDto {
  @ApiProperty({ example: 'uuid-venda' })
  @IsString()
  vendaId: string;

  @ApiProperty({ enum: PagamentoTipo })
  @IsEnum(PagamentoTipo)
  tipo: PagamentoTipo;

  @ApiProperty({ example: 100.00 })
  @IsNumber()
  @Min(0)
  valor: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(48)
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
  chavePix?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  idTransacao?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pixCopiaCola?: string;

  @ApiPropertyOptional({ example: 100.00 })
  @IsOptional()
  @IsNumber()
  trocoPara?: number;
}

export class PagamentoQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vendaId?: string;

  @ApiPropertyOptional({ enum: PagamentoTipo })
  @IsOptional()
  @IsEnum(PagamentoTipo)
  tipo?: PagamentoTipo;
}

export class EstornarPagamentoDto {
  @ApiProperty()
  @IsString()
  motivo: string;

  @ApiProperty()
  @IsString()
  operadorId: string;
}
