import { IsString, IsEnum, IsOptional, IsNumber, IsBoolean, IsUUID, Min, Max, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum BiometriaTipo {
  DIGITAL = 'DIGITAL',
  FACE = 'FACE',
  IRIS = 'IRIS',
}

export enum BiometriaStatus {
  ATIVO = 'ATIVO',
  BLOQUEADO = 'BLOQUEADO',
  EXPIRADO = 'EXPIRADO',
}

export enum DeviceTipo {
  RELOGIO_PONTO = 'RELOGIO_PONTO',
  LEITOR_DIGITAL = 'LEITOR_DIGITAL',
  CAMERA = 'CAMERA',
  TABLET = 'TABLET',
  CELULAR = 'CELULAR',
}

export class RegisterDigitalDto {
  @ApiProperty()
  @IsUUID()
  funcionarioId: string;

  @ApiProperty()
  @IsString()
  templateHash: string;

  @ApiProperty()
  @IsString()
  templateFormato: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dedo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  qualidade?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  dispositivoId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  deviceId?: string;
}

export class RegisterFaceDto {
  @ApiProperty()
  @IsUUID()
  funcionarioId: string;

  @ApiProperty()
  @IsString()
  templateHash: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fotoBase64?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  qualidade?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  iluminacao?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  angulo?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  dispositivoId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  deviceId?: string;
}

export class ValidarBiometriaDto {
  @ApiProperty()
  @IsUUID()
  funcionarioId: string;

  @ApiProperty({ enum: BiometriaTipo })
  @IsEnum(BiometriaTipo)
  tipo: BiometriaTipo;

  @ApiProperty()
  @IsString()
  templateHash: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  deviceId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  exigirLiveness?: boolean;
}

export class BiometriaQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  funcionarioId?: string;

  @ApiPropertyOptional({ enum: BiometriaTipo })
  @IsOptional()
  @IsEnum(BiometriaTipo)
  tipo?: BiometriaTipo;

  @ApiPropertyOptional({ enum: BiometriaStatus })
  @IsOptional()
  @IsEnum(BiometriaStatus)
  status?: BiometriaStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class BiometriaDeviceDto {
  @ApiProperty()
  @IsString()
  nome: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fabricante?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  modelo?: string;

  @ApiProperty({ enum: DeviceTipo })
  @IsEnum(DeviceTipo)
  tipo: DeviceTipo;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ip?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mac?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  serial?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  unidadeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  localizacao?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}

export class SpoofingAlertDto {
  @ApiProperty()
  @IsUUID()
  funcionarioId: string;

  @ApiProperty({ enum: BiometriaTipo })
  @IsEnum(BiometriaTipo)
  tipo: BiometriaTipo;

  @ApiProperty()
  @IsString()
  motivo: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  scoreSuspeita?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  deviceId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fotoEvidencia?: string;
}
