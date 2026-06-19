import { IsString, IsOptional, IsNumber, IsUUID, IsEnum, Min, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoMovimento } from '@prisma/client';

export class CreateMovimentoDto {
  @ApiProperty()
  @IsUUID()
  produtoId: string;

  @ApiProperty()
  @IsUUID()
  unidadeId: string;

  @ApiProperty({ enum: TipoMovimento })
  @IsEnum(TipoMovimento)
  tipo: TipoMovimento;

  @ApiProperty()
  @IsNumber()
  @Min(0.001)
  quantidade: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  documento?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lote?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  validade?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observacao?: string;

  @ApiProperty()
  @IsUUID()
  usuarioId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  data?: string;
}

export class MovimentoQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  produtoId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tipo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dataInicio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dataFim?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  limit?: number;
}
