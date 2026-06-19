import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, Min, IsDateString, IsArray } from 'class-validator';

export class PeriodoDto {
  @ApiProperty({ description: 'Data inicial (YYYY-MM-DD)' })
  @IsDateString()
  dataInicio: string;

  @ApiProperty({ description: 'Data final (YYYY-MM-DD)' })
  @IsDateString()
  dataFim: string;
}

export class FluxoCaixaDto extends PeriodoDto {}

export class LucratividadeDto extends PeriodoDto {}

export class CustosDto extends PeriodoDto {}

export class InadimplenciaDto {
  @ApiPropertyOptional({ description: 'Quantidade de dias para previsão' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  diasPrevisao?: number;
}

export class RecomendacaoEconomiaDto {
  @ApiPropertyOptional({ description: 'Categoria específica para análise' })
  @IsOptional()
  @IsString()
  categoria?: string;

  @ApiPropertyOptional({ description: 'Orçamento alvo' })
  @IsOptional()
  @IsNumber()
  orcamentoAlvo?: number;
}
