import { IsString, IsEnum, IsOptional, IsBoolean, IsArray, IsDateString, IsUUID, IsNumber, Min, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PromocaoTipo } from '@prisma/client';
import { Type } from 'class-transformer';

export class PromocaoProdutoDto {
  @ApiProperty()
  @IsUUID()
  produtoId: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  precoPromocional: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  quantidadeMaxima: number;
}

export class CreatePromocaoDto {
  @ApiProperty()
  @IsString()
  companyId: string;

  @ApiProperty()
  @IsString()
  nome: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiProperty({ enum: PromocaoTipo })
  @IsEnum(PromocaoTipo)
  tipo: PromocaoTipo;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  regras?: Record<string, any>[];

  @ApiProperty()
  @IsDateString()
  dataInicio: string;

  @ApiProperty()
  @IsDateString()
  dataFim: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;

  @ApiPropertyOptional({ type: [PromocaoProdutoDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PromocaoProdutoDto)
  produtos?: PromocaoProdutoDto[];
}

export class UpdatePromocaoDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiPropertyOptional({ enum: PromocaoTipo })
  @IsOptional()
  @IsEnum(PromocaoTipo)
  tipo?: PromocaoTipo;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  regras?: Record<string, any>[];

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
  @IsBoolean()
  ativo?: boolean;

  @ApiPropertyOptional({ type: [PromocaoProdutoDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PromocaoProdutoDto)
  produtos?: PromocaoProdutoDto[];
}

export class PromocaoQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: PromocaoTipo })
  @IsOptional()
  @IsEnum(PromocaoTipo)
  tipo?: PromocaoTipo;

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
