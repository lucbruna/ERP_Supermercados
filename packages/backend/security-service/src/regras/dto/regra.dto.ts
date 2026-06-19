import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsObject, IsEnum } from 'class-validator';

export enum TipoRegra {
  IP_BLOCK = 'IP_BLOCK',
  ACCESS_HOUR = 'ACCESS_HOUR',
  HORARIO_PERMITIDO = 'HORARIO_PERMITIDO',
  DEVICE_RESTRICTION = 'DEVICE_RESTRICTION',
}

export class CriarRegraDto {
  @ApiProperty()
  @IsString()
  nome: string;

  @ApiProperty({ enum: TipoRegra })
  @IsEnum(TipoRegra)
  tipo: TipoRegra;

  @ApiProperty()
  @IsObject()
  config: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;

  @ApiProperty()
  @IsString()
  criadoPor: string;
}

export class AtualizarRegraDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiPropertyOptional({ enum: TipoRegra })
  @IsOptional()
  @IsEnum(TipoRegra)
  tipo?: TipoRegra;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  config?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
