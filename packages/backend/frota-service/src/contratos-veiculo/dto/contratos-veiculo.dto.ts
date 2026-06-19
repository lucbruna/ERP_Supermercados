import { IsString, IsEnum, IsOptional, IsNumber, IsDateString, IsUUID, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum TipoContratoEnum {
  SEGURO = 'SEGURO',
  FINANCIAMENTO = 'FINANCIAMENTO',
  LEASING = 'LEASING',
}

export enum StatusContratoEnum {
  ATIVO = 'ATIVO',
  VENCIDO = 'VENCIDO',
  CANCELADO = 'CANCELADO',
}

export class CreateContratoVeiculoDto {
  @ApiProperty() @IsUUID() veiculoId: string;
  @ApiProperty({ enum: TipoContratoEnum }) @IsEnum(TipoContratoEnum) tipo: TipoContratoEnum;
  @ApiPropertyOptional() @IsOptional() @IsString() seguradora?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() instituicao?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() numeroApolice?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() numeroContrato?: string;
  @ApiProperty() @IsNumber() @Min(0) valor: number;
  @ApiProperty() @IsDateString() dataInicio: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dataFim?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dataVencimento?: string;
  @ApiPropertyOptional() @IsOptional() @IsEnum(StatusContratoEnum) status?: StatusContratoEnum;
  @ApiPropertyOptional() @IsOptional() @IsString() observacoes?: string;
}

export class UpdateContratoVeiculoDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() veiculoId?: string;
  @ApiPropertyOptional() @IsOptional() @IsEnum(TipoContratoEnum) tipo?: TipoContratoEnum;
  @ApiPropertyOptional() @IsOptional() @IsString() seguradora?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() instituicao?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() numeroApolice?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() numeroContrato?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) valor?: number;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dataInicio?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dataFim?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dataVencimento?: string;
  @ApiPropertyOptional() @IsOptional() @IsEnum(StatusContratoEnum) status?: StatusContratoEnum;
  @ApiPropertyOptional() @IsOptional() @IsString() observacoes?: string;
}

export class ContratoVeiculoQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() veiculoId?: string;
  @ApiPropertyOptional() @IsOptional() @IsEnum(TipoContratoEnum) tipo?: TipoContratoEnum;
  @ApiPropertyOptional() @IsOptional() @IsEnum(StatusContratoEnum) status?: StatusContratoEnum;
  @ApiPropertyOptional() @IsOptional() @IsNumber() page?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() limit?: number;
}
