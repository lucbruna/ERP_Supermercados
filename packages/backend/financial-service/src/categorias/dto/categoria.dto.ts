import { IsString, IsBoolean, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoCategoria } from '@prisma/client';

export class CreateCategoriaDto {
  @ApiProperty()
  @IsString()
  companyId: string;

  @ApiProperty({ example: 'Vendas de Mercadorias' })
  @IsString()
  nome: string;

  @ApiProperty({ enum: TipoCategoria })
  @IsEnum(TipoCategoria)
  tipo: TipoCategoria;

  @ApiProperty({ example: 'FATURAMENTO' })
  @IsString()
  centroCusto: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}

export class UpdateCategoriaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiPropertyOptional({ enum: TipoCategoria })
  @IsOptional()
  @IsEnum(TipoCategoria)
  tipo?: TipoCategoria;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  centroCusto?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}

export class QueryCategoriaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companyId?: string;

  @ApiPropertyOptional({ enum: TipoCategoria })
  @IsOptional()
  @IsEnum(TipoCategoria)
  tipo?: TipoCategoria;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  centroCusto?: string;
}
