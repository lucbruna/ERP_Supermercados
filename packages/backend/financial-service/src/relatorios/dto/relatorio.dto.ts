import { IsString, IsOptional, IsDateString, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RelatorioFluxoCaixaDto {
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

export class RelatorioAgingDto {
  @ApiProperty()
  @IsString()
  companyId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dataBase?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  pagina?: number;

  @ApiPropertyOptional({ default: 100 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  limite?: number;
}

export class RelatorioDreDto {
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
