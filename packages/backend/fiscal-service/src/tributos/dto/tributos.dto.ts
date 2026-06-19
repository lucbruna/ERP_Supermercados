import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CalcularIcmsDto {
  @ApiProperty() @IsString() ufOrigem: string;
  @ApiProperty() @IsString() ufDestino: string;
  @ApiProperty() @IsNumber() @Min(0) valorProdutos: number;
  @ApiProperty() @IsNumber() @Min(0) valorFrete: number;
  @ApiProperty() @IsNumber() @Min(0) valorSeguro: number;
  @ApiProperty() @IsNumber() @Min(0) valorDespesas: number;
  @ApiProperty() @IsString() cstIcms: string;
  @ApiPropertyOptional() @IsOptional() @IsString() csosn?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() aliquotaPersonalizada?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() reducaoBase?: number;
}

export class CalcularPisCofinsDto {
  @ApiProperty() @IsNumber() @Min(0) valorTotal: number;
  @ApiPropertyOptional({ default: 'cumulativo' }) @IsOptional() @IsString() regime?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() aliquotaPis?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() aliquotaCofins?: number;
}

export class CalcularTotalTributosDto {
  @ApiProperty() @IsString() ufOrigem: string;
  @ApiProperty() @IsString() ufDestino: string;
  @ApiProperty() @IsNumber() @Min(0) valorProdutos: number;
  @ApiProperty() @IsNumber() @Min(0) valorFrete: number;
  @ApiProperty() @IsNumber() @Min(0) valorSeguro: number;
  @ApiProperty() @IsNumber() @Min(0) valorDespesas: number;
  @ApiProperty() @IsNumber() @Min(0) valorDesconto: number;
  @ApiProperty() @IsString() cstIcms: string;
  @ApiPropertyOptional() @IsOptional() @IsString() csosn?: string;
  @ApiPropertyOptional({ default: 'cumulativo' }) @IsOptional() @IsString() regimePis?: string;
  @ApiProperty() @IsString() ncm: string;
  @ApiProperty() @IsString() cfop: string;
}
