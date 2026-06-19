import { IsString, IsEnum, IsDateString, IsOptional, IsNumber, IsBoolean, IsUUID, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PontoTipo, PontoOrigem } from '@prisma/client';

export class CreateRegistroPontoDto {
  @ApiProperty()
  @IsUUID()
  funcionarioId: string;

  @ApiProperty({ enum: PontoTipo })
  @IsEnum(PontoTipo)
  tipo: PontoTipo;

  @ApiProperty()
  @IsDateString()
  dataHora: string;

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
  fotoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  biometriaHash?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  faceMatch?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  digitalMatch?: boolean;

  @ApiProperty({ enum: PontoOrigem })
  @IsEnum(PontoOrigem)
  origem: PontoOrigem;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ip?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dispositivoId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  metodoBiometrico?: string;
}

export class PontoBiometricoDto {
  @ApiProperty()
  @IsUUID()
  funcionarioId: string;

  @ApiProperty({ enum: PontoTipo })
  @IsEnum(PontoTipo)
  tipo: PontoTipo;

  @ApiProperty()
  @IsDateString()
  dataHora: string;

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
  fotoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  templateHash?: string;

  @ApiProperty({ enum: ['DIGITAL', 'FACE', 'DUPLO'] })
  @IsEnum(['DIGITAL', 'FACE', 'DUPLO'])
  biometriaTipo: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ip?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dispositivoId?: string;
}

export class UpdateRegistroPontoDto {
  @ApiPropertyOptional({ enum: PontoTipo })
  @IsOptional()
  @IsEnum(PontoTipo)
  tipo?: PontoTipo;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dataHora?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  validado?: boolean;
}

export class PontoQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  funcionarioId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dataInicio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dataFim?: string;

  @ApiPropertyOptional({ enum: PontoTipo })
  @IsOptional()
  @IsEnum(PontoTipo)
  tipo?: PontoTipo;

  @ApiPropertyOptional({ enum: PontoOrigem })
  @IsOptional()
  @IsEnum(PontoOrigem)
  origem?: PontoOrigem;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class PontoRelatorioDto {
  @ApiProperty()
  @IsUUID()
  funcionarioId: string;

  @ApiProperty()
  @IsNumber()
  mes: number;

  @ApiProperty()
  @IsNumber()
  ano: number;
}
