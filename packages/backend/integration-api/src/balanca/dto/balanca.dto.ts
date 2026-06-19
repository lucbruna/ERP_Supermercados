import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegistrarPesoDto {
  @ApiProperty() @IsString() companyId: string;
  @ApiProperty() @IsString() unidadeId: string;
  @ApiProperty() @IsString() balancaId: string;
  @ApiPropertyOptional() @IsOptional() @IsString() produtoId?: string;
  @ApiProperty() @IsNumber() @Min(0.001) peso: number;
  @ApiPropertyOptional({ default: 'KG' }) @IsOptional() @IsString() unidade?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() lote?: string;
}

export class PesoQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() balancaId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() produtoId?: string;
  @ApiPropertyOptional({ default: 1 }) @IsOptional() @IsNumber() pagina?: number;
  @ApiPropertyOptional({ default: 10 }) @IsOptional() @IsNumber() limite?: number;
}
