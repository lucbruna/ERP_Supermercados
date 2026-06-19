import { IsString, IsEnum, IsOptional, IsNumber, IsUUID, IsDateString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum FaturaStatusEnum {
  PENDENTE = 'PENDENTE',
  PARCIAL = 'PARCIAL',
  PAGA = 'PAGA',
  ATRASADA = 'ATRASADA',
  CANCELADA = 'CANCELADA',
}

export class CreateFaturaDto {
  @ApiProperty() @IsUUID() companyId: string;
  @ApiProperty() @IsUUID() convenioId: string;
  @ApiProperty() @IsString() numero: string;
  @ApiProperty() @IsDateString() dataEmissao: string;
  @ApiProperty() @IsDateString() dataVencimento: string;
  @ApiProperty() @IsNumber() valorTotal: number;
  @ApiPropertyOptional() @IsOptional() @IsString() observacao?: string;
}

export class PagarFaturaDto {
  @ApiPropertyOptional() @IsOptional() @IsDateString() dataPagamento?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) valorPago?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) multa?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) juros?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) desconto?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() formaPagamento?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() observacao?: string;
}

export class FaturaQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() convenioId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() status?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dataInicio?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dataFim?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() page?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() limit?: number;
}
