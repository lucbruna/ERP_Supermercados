import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, IsDateString, IsBoolean, IsNumber, Min as MinNum, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum TipoEvento {
  ROUBO = 'ROUBO',
  MOVIMENTO_SUSPEITO = 'MOVIMENTO_SUSPEITO',
  AGLOMERACAO = 'AGLOMERACAO',
  QUEDA = 'QUEDA',
  PERMANENCIA = 'PERMANENCIA',
  PLACA = 'PLACA',
  FACIAL = 'FACIAL',
}

export class EventoQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 50;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cameraId?: string;

  @ApiPropertyOptional({ enum: TipoEvento })
  @IsOptional()
  @IsString()
  tipo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @MinNum(0)
  @Max(1)
  confiancaMinima?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  processado?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dataInicio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dataFim?: string;
}
