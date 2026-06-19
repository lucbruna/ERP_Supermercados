import { IsString, IsEnum, IsOptional, IsNumber, IsUUID, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum TipoVeiculoEnum {
  PASSEIO = 'PASSEIO',
  CARGA = 'CARGA',
  UTILITARIO = 'UTILITARIO',
  CAMINHAO = 'CAMINHAO',
  VAN = 'VAN',
}

export enum CombustivelEnum {
  GASOLINA = 'GASOLINA',
  ETANOL = 'ETANOL',
  DIESEL = 'DIESEL',
  FLEX = 'FLEX',
  ELETRICO = 'ELETRICO',
}

export enum SituacaoVeiculoEnum {
  ATIVO = 'ATIVO',
  INATIVO = 'INATIVO',
  MANUTENCAO = 'MANUTENCAO',
  BAIXADO = 'BAIXADO',
}

export class CreateVeiculoDto {
  @ApiProperty() @IsString() placa: string;
  @ApiPropertyOptional() @IsOptional() @IsString() renavam?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() chassi?: string;
  @ApiProperty() @IsString() marca: string;
  @ApiProperty() @IsString() modelo: string;
  @ApiProperty() @IsNumber() anoFabricacao: number;
  @ApiProperty() @IsNumber() anoModelo: number;
  @ApiPropertyOptional() @IsOptional() @IsString() cor?: string;
  @ApiProperty({ enum: TipoVeiculoEnum }) @IsEnum(TipoVeiculoEnum) tipo: TipoVeiculoEnum;
  @ApiPropertyOptional() @IsOptional() @IsString() categoria?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() capacidadeCarga?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() capacidadeTanque?: number;
  @ApiProperty({ enum: CombustivelEnum }) @IsEnum(CombustivelEnum) combustivel: CombustivelEnum;
  @ApiPropertyOptional() @IsOptional() @IsNumber() kmAtual?: number;
  @ApiPropertyOptional() @IsOptional() @IsEnum(SituacaoVeiculoEnum) situacao?: SituacaoVeiculoEnum;
  @ApiPropertyOptional() @IsOptional() @IsString() observacoes?: string;
}

export class UpdateVeiculoDto {
  @ApiPropertyOptional() @IsOptional() @IsString() placa?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() renavam?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() chassi?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() marca?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() modelo?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() anoFabricacao?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() anoModelo?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() cor?: string;
  @ApiPropertyOptional() @IsOptional() @IsEnum(TipoVeiculoEnum) tipo?: TipoVeiculoEnum;
  @ApiPropertyOptional() @IsOptional() @IsString() categoria?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() capacidadeCarga?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() capacidadeTanque?: number;
  @ApiPropertyOptional() @IsOptional() @IsEnum(CombustivelEnum) combustivel?: CombustivelEnum;
  @ApiPropertyOptional() @IsOptional() @IsNumber() kmAtual?: number;
  @ApiPropertyOptional() @IsOptional() @IsEnum(SituacaoVeiculoEnum) situacao?: SituacaoVeiculoEnum;
  @ApiPropertyOptional() @IsOptional() @IsString() observacoes?: string;
}

export class UpdateSituacaoDto {
  @ApiProperty({ enum: SituacaoVeiculoEnum }) @IsEnum(SituacaoVeiculoEnum) situacao: SituacaoVeiculoEnum;
}

export class UpdateKmDto {
  @ApiProperty() @IsNumber() @Min(0) kmAtual: number;
}

export class VeiculoQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional() @IsOptional() @IsEnum(SituacaoVeiculoEnum) situacao?: SituacaoVeiculoEnum;
  @ApiPropertyOptional() @IsOptional() @IsEnum(TipoVeiculoEnum) tipo?: TipoVeiculoEnum;
  @ApiPropertyOptional() @IsOptional() @IsNumber() page?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() limit?: number;
}
