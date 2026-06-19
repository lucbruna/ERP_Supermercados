import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';

export enum GrupoRelatorio {
  PRODUTO = 'produto',
  CATEGORIA = 'categoria',
  LOJA = 'loja',
  REGIAO = 'regiao',
}

export class RelatorioVendasDto {
  @ApiProperty({ description: 'Data inicial (YYYY-MM-DD)' })
  @IsDateString()
  dataInicio: string;

  @ApiProperty({ description: 'Data final (YYYY-MM-DD)' })
  @IsDateString()
  dataFim: string;

  @ApiPropertyOptional({ enum: GrupoRelatorio, default: GrupoRelatorio.PRODUTO })
  @IsOptional()
  @IsEnum(GrupoRelatorio)
  grupo?: GrupoRelatorio;
}

export class RelatorioEstoqueDto {
  @ApiPropertyOptional({ description: 'Categoria de produto' })
  @IsOptional()
  @IsString()
  categoria?: string;
}

export class RelatorioRHDto {
  @ApiPropertyOptional({ description: 'Departamento específico' })
  @IsOptional()
  @IsString()
  departamento?: string;
}

export class RelatorioResumoExecutivoDto {
  @ApiProperty({ description: 'Data inicial (YYYY-MM-DD)' })
  @IsDateString()
  dataInicio: string;

  @ApiProperty({ description: 'Data final (YYYY-MM-DD)' })
  @IsDateString()
  dataFim: string;
}
