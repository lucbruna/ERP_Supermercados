import { IsString, IsEnum, IsArray, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CampanhaTipo } from '@prisma/client';

export class CreateModeloDto {
  @ApiProperty()
  @IsString()
  companyId: string;

  @ApiProperty()
  @IsString()
  nome: string;

  @ApiProperty({ enum: CampanhaTipo })
  @IsEnum(CampanhaTipo)
  tipo: CampanhaTipo;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assunto?: string;

  @ApiProperty()
  @IsString()
  conteudo: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  variaveis?: string[];
}

export class UpdateModeloDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiPropertyOptional({ enum: CampanhaTipo })
  @IsOptional()
  @IsEnum(CampanhaTipo)
  tipo?: CampanhaTipo;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assunto?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  conteudo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  variaveis?: string[];
}

export class ModeloQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: CampanhaTipo })
  @IsOptional()
  @IsEnum(CampanhaTipo)
  tipo?: CampanhaTipo;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  limit?: number;
}
