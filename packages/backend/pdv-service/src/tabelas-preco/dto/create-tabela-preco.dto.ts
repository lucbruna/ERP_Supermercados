import { IsString, IsOptional, IsEnum, IsBoolean, IsNumber, IsUUID, Min, IsDateString, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum TipoPreco {
  PADRAO = 'PADRAO',
  PROMOCIONAL = 'PROMOCIONAL',
  CLIENTE = 'CLIENTE',
  QUANTIDADE = 'QUANTIDADE',
  ATACADO = 'ATACADO',
}

export class ItemPrecoDto {
  @ApiProperty()
  @IsUUID()
  produtoId: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  preco: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  precoMinimo?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  quantidadeMinima?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  clienteId?: string;
}

export class CreateTabelaPrecoDto {
  @ApiProperty()
  @IsUUID()
  companyId: string;

  @ApiProperty()
  @IsString()
  nome: string;

  @ApiProperty({ enum: TipoPreco })
  @IsEnum(TipoPreco)
  tipo: TipoPreco;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dataInicio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dataFim?: string;

  @ApiPropertyOptional({ type: [ItemPrecoDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemPrecoDto)
  itens?: ItemPrecoDto[];
}

export class UpdateTabelaPrecoDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiPropertyOptional({ enum: TipoPreco })
  @IsOptional()
  @IsEnum(TipoPreco)
  tipo?: TipoPreco;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dataInicio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dataFim?: string;
}

export class TabelaPrecoQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: TipoPreco })
  @IsOptional()
  @IsEnum(TipoPreco)
  tipo?: TipoPreco;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class CalcularPrecoDto {
  @ApiProperty()
  @IsUUID()
  produtoId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  clienteId?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  quantidade?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  unidadeId?: string;
}

export class AdicionarItemPrecoDto {
  @ApiProperty()
  @IsUUID()
  produtoId: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  preco: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  precoMinimo?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  quantidadeMinima?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  clienteId?: string;
}
