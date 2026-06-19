import { IsString, IsNumber, IsEnum, IsOptional, IsUUID, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HabilidadeCategoria } from '@prisma/client';

export class CreateHabilidadeDto {
  @ApiProperty()
  @IsString()
  nome: string;

  @ApiProperty({ enum: HabilidadeCategoria })
  @IsEnum(HabilidadeCategoria)
  categoria: HabilidadeCategoria;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  nivelMinimo?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descricao?: string;
}

export class UpdateHabilidadeDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiPropertyOptional({ enum: HabilidadeCategoria })
  @IsOptional()
  @IsEnum(HabilidadeCategoria)
  categoria?: HabilidadeCategoria;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  nivelMinimo?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descricao?: string;
}

export class HabilidadeQueryDto {
  @ApiPropertyOptional({ enum: HabilidadeCategoria })
  @IsOptional()
  @IsEnum(HabilidadeCategoria)
  categoria?: HabilidadeCategoria;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class VincularHabilidadeDto {
  @ApiProperty()
  @IsUUID()
  funcionarioId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  nivelAtual?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observacoes?: string;
}

export class AtualizarNivelHabilidadeDto {
  @ApiProperty()
  @IsNumber()
  @Min(1)
  @Max(5)
  nivelAtual: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observacoes?: string;
}
