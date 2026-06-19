import { IsString, IsEnum, IsOptional, IsNumber, IsUUID, IsDateString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum CombustivelEnum {
  GASOLINA = 'GASOLINA',
  ETANOL = 'ETANOL',
  DIESEL = 'DIESEL',
  FLEX = 'FLEX',
  ELETRICO = 'ELETRICO',
}

export class CreateAbastecimentoDto {
  @ApiProperty() @IsUUID() veiculoId: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() motoristaId?: string;
  @ApiProperty() @IsDateString() data: string;
  @ApiProperty() @IsNumber() @Min(0) litros: number;
  @ApiProperty() @IsNumber() @Min(0) valorLitro: number;
  @ApiProperty() @IsNumber() @Min(0) valorTotal: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() kmAtual?: number;
  @ApiProperty({ enum: CombustivelEnum }) @IsEnum(CombustivelEnum) tipoCombustivel: CombustivelEnum;
  @ApiPropertyOptional() @IsOptional() @IsString() posto?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notaFiscal?: string;
}

export class UpdateAbastecimentoDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() veiculoId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() motoristaId?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() data?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) litros?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) valorLitro?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) valorTotal?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() kmAtual?: number;
  @ApiPropertyOptional() @IsOptional() @IsEnum(CombustivelEnum) tipoCombustivel?: CombustivelEnum;
  @ApiPropertyOptional() @IsOptional() @IsString() posto?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notaFiscal?: string;
}

export class AbastecimentoQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() veiculoId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() periodo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() dataInicio?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() dataFim?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() page?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() limit?: number;
}

export class RelatorioConsumoQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() periodo?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() veiculoId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() dataInicio?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() dataFim?: string;
}
