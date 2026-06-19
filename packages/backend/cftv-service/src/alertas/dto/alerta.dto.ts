import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsArray, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum TipoAlerta {
  ROUBO = 'ROUBO',
  MOVIMENTO_SUSPEITO = 'MOVIMENTO_SUSPEITO',
  AGLOMERACAO = 'AGLOMERACAO',
  QUEDA = 'QUEDA',
  PERMANENCIA = 'PERMANENCIA',
  PLACA = 'PLACA',
  FACIAL = 'FACIAL',
  SISTEMA = 'SISTEMA',
}

export class CriarAlertaDto {
  @ApiProperty()
  @IsString()
  cameraId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  eventoId?: string;

  @ApiProperty({ enum: TipoAlerta })
  @IsEnum(TipoAlerta)
  tipo: TipoAlerta;

  @ApiProperty()
  @IsString()
  mensagem: string;

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  destinatarios: string[];
}

export class AlertaQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cameraId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tipo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  enviado?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  limit?: number = 50;
}
