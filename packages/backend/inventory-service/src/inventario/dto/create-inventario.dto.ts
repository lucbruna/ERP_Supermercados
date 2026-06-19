import { IsString, IsOptional, IsNumber, IsUUID, IsEnum, IsDateString, IsArray, ValidateNested, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { TipoInventario, StatusInventario } from '@prisma/client';

export class CreateInventarioDto {
  @ApiProperty()
  @IsUUID()
  companyId: string;

  @ApiProperty()
  @IsUUID()
  unidadeId: string;

  @ApiProperty({ enum: TipoInventario })
  @IsEnum(TipoInventario)
  tipo: TipoInventario;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  setor?: string;

  @ApiProperty()
  @IsDateString()
  dataInicio: string;

  @ApiProperty()
  @IsUUID()
  responsavelId: string;
}

export class InventarioItemDto {
  @ApiProperty()
  @IsUUID()
  produtoId: string;

  @ApiProperty()
  @IsString()
  codigo: string;

  @ApiProperty()
  @IsString()
  descricao: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  quantidadeSistema: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  quantidadeContada: number;

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
}

export class RealizarContagemDto {
  @ApiProperty({ type: [InventarioItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InventarioItemDto)
  itens: InventarioItemDto[];
}

export class FecharInventarioDto {
  @ApiProperty()
  @IsUUID()
  aprovadoPor: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observacao?: string;
}

export class InventarioQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tipo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  limit?: number;
}
