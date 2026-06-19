import { IsString, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrientacaoEtiqueta } from '@prisma/client';

export class CreateEtiquetaDto {
  @ApiProperty()
  @IsString()
  nome: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  largura: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  altura: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  margemSuperior?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  margemInferior?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  margemEsquerda?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  margemDireita?: number;

  @ApiProperty({ enum: OrientacaoEtiqueta, default: 'Retrato' })
  @IsEnum(OrientacaoEtiqueta)
  orientacao: OrientacaoEtiqueta;

  @ApiProperty({ description: 'JSON com configuração dos campos na etiqueta' })
  @IsString()
  camposJson: string;
}

export class UpdateEtiquetaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  largura?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  altura?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  margemSuperior?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  margemInferior?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  margemEsquerda?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  margemDireita?: number;

  @ApiPropertyOptional({ enum: OrientacaoEtiqueta })
  @IsOptional()
  @IsEnum(OrientacaoEtiqueta)
  orientacao?: OrientacaoEtiqueta;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  camposJson?: string;
}

export class PreviewEtiquetaDto {
  @ApiProperty()
  @IsString()
  codigoBarras: string;

  @ApiPropertyOptional({ description: 'Informações adicionais para preenchimento dos campos' })
  @IsOptional()
  campos?: Record<string, string>;
}
