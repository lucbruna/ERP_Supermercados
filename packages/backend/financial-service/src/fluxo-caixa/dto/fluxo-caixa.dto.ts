import { IsString, IsNumber, IsDateString, IsOptional, IsEnum, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoFluxo } from '@prisma/client';

export class GerarProjecaoDto {
  @ApiProperty()
  @IsString()
  companyId: string;

  @ApiProperty()
  @IsDateString()
  dataInicio: string;

  @ApiProperty()
  @IsDateString()
  dataFim: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  unidadeId?: string;
}

export class QueryFluxoCaixaDto {
  @ApiProperty()
  @IsString()
  companyId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  unidadeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dataInicio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dataFim?: string;

  @ApiPropertyOptional({ enum: TipoFluxo })
  @IsOptional()
  @IsEnum(TipoFluxo)
  tipo?: TipoFluxo;

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

export class SaldoDiarioDto {
  @ApiProperty()
  @IsDateString()
  data: string;

  @ApiProperty()
  @IsNumber()
  saldoInicial: number;

  @ApiProperty()
  @IsNumber()
  totalEntradas: number;

  @ApiProperty()
  @IsNumber()
  totalSaidas: number;

  @ApiProperty()
  @IsNumber()
  saldoFinal: number;

  @ApiPropertyOptional({ enum: TipoFluxo, default: 'REAL' })
  @IsOptional()
  @IsEnum(TipoFluxo)
  tipo?: TipoFluxo;
}
