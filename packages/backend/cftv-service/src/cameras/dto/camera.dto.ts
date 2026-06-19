import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsInt, IsBoolean, IsOptional, IsEnum, IsIP, Min, Max } from 'class-validator';

export enum TipoCamera {
  IP = 'IP',
  DVR = 'DVR',
  NVR = 'NVR',
  ANALOGICA = 'ANALOGICA',
}

export enum ProtocoloCamera {
  RTSP = 'RTSP',
  ONVIF = 'ONVIF',
  HTTP = 'HTTP',
  HIKVISION = 'HIKVISION',
  DAHUA = 'DAHUA',
}

export enum StatusCamera {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  MANUTENCAO = 'MANUTENCAO',
}

export class CriarCameraDto {
  @ApiProperty()
  @IsString()
  nome: string;

  @ApiProperty()
  @IsIP()
  ip: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  @Max(65535)
  porta: number;

  @ApiPropertyOptional({ enum: TipoCamera, default: 'IP' })
  @IsOptional()
  @IsEnum(TipoCamera)
  tipo?: TipoCamera;

  @ApiPropertyOptional({ enum: ProtocoloCamera, default: 'RTSP' })
  @IsOptional()
  @IsEnum(ProtocoloCamera)
  protocolo?: ProtocoloCamera;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  resolucao?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  localizacao?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  urlStream?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  urlSnapshot?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasAI?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  deteccoes?: any[];
}

export class AtualizarCameraDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIP()
  ip?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(65535)
  porta?: number;

  @ApiPropertyOptional({ enum: TipoCamera })
  @IsOptional()
  @IsEnum(TipoCamera)
  tipo?: TipoCamera;

  @ApiPropertyOptional({ enum: ProtocoloCamera })
  @IsOptional()
  @IsEnum(ProtocoloCamera)
  protocolo?: ProtocoloCamera;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  resolucao?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  localizacao?: string;

  @ApiPropertyOptional({ enum: StatusCamera })
  @IsOptional()
  @IsEnum(StatusCamera)
  status?: StatusCamera;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  urlStream?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  urlSnapshot?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasAI?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  deteccoes?: any[];
}
