import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsObject, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class LeituraPlacaQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cameraId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  placa?: string;

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

export class CriarLeituraPlacaDto {
  @ApiProperty()
  @IsString()
  cameraId: string;

  @ApiProperty()
  @IsString()
  snapshotUrl: string;

  @ApiProperty()
  @IsString()
  placa: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(1)
  confianca: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
