import { IsString, IsEnum, IsOptional, IsNumber, IsUUID, IsDateString, IsArray, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVendaConvenioDto {
  @ApiProperty() @IsUUID() companyId: string;
  @ApiProperty() @IsUUID() unidadeId: string;
  @ApiPropertyOptional() @IsOptional() @IsString() pdvId?: string;
  @ApiProperty() @IsUUID() convenioId: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() contratoId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() clienteId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() clienteNome?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() clienteCpf?: string;
  @ApiProperty() @IsString() numero: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() itens?: any[];
  @ApiProperty() @IsNumber() valorBruto: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) desconto?: number;
  @ApiProperty() @IsNumber() valorLiquido: number;
  @ApiProperty() @IsDateString() dataVenda: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dataVencimento?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() observacao?: string;
}

export class VendaConvenioQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() convenioId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() contratoId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() status?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dataInicio?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dataFim?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() page?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() limit?: number;
}
