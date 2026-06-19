import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional, IsObject, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class ReconhecimentoQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cameraId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  desconhecido?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  confiancaMinima?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  limit?: number = 50;
}

export class CriarReconhecimentoDto {
  @ApiProperty()
  @IsString()
  cameraId: string;

  @ApiProperty()
  @IsString()
  snapshotUrl: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(1)
  confianca: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  desconhecido?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
