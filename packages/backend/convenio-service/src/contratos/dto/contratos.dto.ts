import { IsString, IsEnum, IsOptional, IsNumber, IsUUID, IsDateString, Min, Max, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ContratoStatusEnum {
  ATIVO = 'ATIVO',
  CANCELADO = 'CANCELADO',
  ENCERRADO = 'ENCERRADO',
}

export class CreateContratoDto {
  @ApiProperty() @IsUUID() convenioId: string;
  @ApiProperty() @IsString() numero: string;
  @ApiProperty() @IsDateString() dataInicio: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dataFim?: string;
  @ApiProperty() @IsNumber() valor: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() limiteMensal?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() carencia?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) @Max(100) taxaJuros?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) @Max(100) multaAtraso?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) @Max(100) jurosMora?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() observacao?: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() anexos?: any[];
}

export class UpdateContratoDto {
  @ApiPropertyOptional() @IsOptional() @IsDateString() dataInicio?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dataFim?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() valor?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() limiteMensal?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() carencia?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) @Max(100) taxaJuros?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) @Max(100) multaAtraso?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) @Max(100) jurosMora?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() observacao?: string;
  @ApiPropertyOptional() @IsOptional() @IsEnum(ContratoStatusEnum) status?: string;
}

export class ContratoQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() convenioId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() status?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() page?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() limit?: number;
}
