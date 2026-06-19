import { IsString, IsEnum, IsOptional, IsNumber, IsUUID, Min, Max, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ConvenioStatusEnum {
  ATIVO = 'ATIVO',
  INATIVO = 'INATIVO',
  BLOQUEADO = 'BLOQUEADO',
}

export enum TipoFaturamentoEnum {
  MENSAL = 'MENSAL',
  SEMANAL = 'SEMANAL',
  QUINZENAL = 'QUINZENAL',
  AVULSO = 'AVULSO',
}

export class CreateConvenioDto {
  @ApiProperty() @IsUUID() companyId: string;
  @ApiProperty() @IsUUID() unidadeId: string;
  @ApiProperty() @IsString() codigo: string;
  @ApiProperty() @IsString() nome: string;
  @ApiPropertyOptional() @IsOptional() @IsString() cnpj?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() contato?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() telefone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() email?: string;
  @ApiPropertyOptional() @IsOptional() @IsObject() endereco?: any;
  @ApiPropertyOptional() @IsOptional() @IsNumber() limiteGlobal?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) @Max(100) descontoPadrao?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() prazoPagamento?: number;
  @ApiPropertyOptional() @IsOptional() @IsEnum(TipoFaturamentoEnum) tipoFaturamento?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(1) @Max(31) diaFechamento?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() observacao?: string;
}

export class UpdateConvenioDto {
  @ApiPropertyOptional() @IsOptional() @IsString() nome?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() cnpj?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() contato?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() telefone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() email?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() limiteGlobal?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) @Max(100) descontoPadrao?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() prazoPagamento?: number;
  @ApiPropertyOptional() @IsOptional() @IsEnum(TipoFaturamentoEnum) tipoFaturamento?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(1) @Max(31) diaFechamento?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() observacao?: string;
  @ApiPropertyOptional() @IsOptional() @IsEnum(ConvenioStatusEnum) status?: string;
}

export class ConvenioQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() status?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() page?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() limit?: number;
}
