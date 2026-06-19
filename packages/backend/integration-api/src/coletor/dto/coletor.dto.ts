import { IsString, IsNumber, IsOptional, IsDateString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class IniciarSessaoDto {
  @ApiProperty() @IsString() companyId: string;
  @ApiProperty() @IsString() unidadeId: string;
  @ApiProperty() @IsString() usuarioId: string;
  @ApiProperty() @IsString() tipo: string; // INVENTARIO, RECEBIMENTO, SEPARACAO, EXPEDICAO
  @ApiPropertyOptional() @IsOptional() @IsString() referenciaId?: string;
}

export class RegistrarLeituraDto {
  @ApiProperty() @IsString() sessaoId: string;
  @ApiPropertyOptional() @IsOptional() @IsString() produtoId?: string;
  @ApiProperty() @IsString() codigoBarras: string;
  @ApiPropertyOptional({ default: 1 }) @IsOptional() @IsNumber() @Min(0.001) quantidade?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() localizacao?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() lote?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dataValidade?: string;
}
