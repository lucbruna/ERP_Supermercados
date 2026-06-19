import { IsString, IsNumber, IsOptional, IsEnum, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StatusConciliacao } from '@prisma/client';

export class CreateConciliacaoDto {
  @ApiProperty()
  @IsString()
  contaBancariaId: string;

  @ApiProperty({ example: 6 })
  @IsNumber()
  @Min(1)
  @Max(12)
  mes: number;

  @ApiProperty({ example: 2024 })
  @IsNumber()
  @Min(2020)
  @Max(2100)
  ano: number;

  @ApiProperty()
  @IsNumber()
  saldoInicial: number;

  @ApiProperty()
  @IsNumber()
  saldoFinal: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  lancamentosConciliados?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  lancamentosPendentes?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  diferencas?: number;

  @ApiPropertyOptional({ enum: StatusConciliacao, default: 'ABERTA' })
  @IsOptional()
  @IsEnum(StatusConciliacao)
  status?: StatusConciliacao;
}

export class UpdateConciliacaoDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  saldoInicial?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  saldoFinal?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  lancamentosConciliados?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  lancamentosPendentes?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  diferencas?: number;

  @ApiPropertyOptional({ enum: StatusConciliacao })
  @IsOptional()
  @IsEnum(StatusConciliacao)
  status?: StatusConciliacao;
}

export class QueryConciliacaoDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contaBancariaId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(12)
  mes?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(2020)
  @Max(2100)
  ano?: number;

  @ApiPropertyOptional({ enum: StatusConciliacao })
  @IsOptional()
  @IsEnum(StatusConciliacao)
  status?: StatusConciliacao;

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
